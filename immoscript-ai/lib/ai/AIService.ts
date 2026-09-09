import Anthropic from "@anthropic-ai/sdk";
import { zodToJsonSchema } from "zod-to-json-schema";
import type { GenerateContentInput } from "./types";
import { schemaForType } from "./schemas";
import { buildAvailableDataBlock, buildMarketingBlock, buildSystemPrompt, PROMPT_VERSION } from "./prompts/system";
import { buildListingInstructions } from "./prompts/listing";
import { buildSocialInstructions } from "./prompts/social";
import { buildVideoScriptInstructions } from "./prompts/videoScript";

const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5";
const TOOL_NAME = "return_generated_content";

export class AIGenerationError extends Error {}

type JsonSchemaObject = {
  type: "object";
  properties?: Record<string, unknown>;
  required?: string[];
  [key: string]: unknown;
};

let client: Anthropic | undefined;

function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new AIGenerationError("ANTHROPIC_API_KEY manquant");
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

function buildTypeInstructions(input: GenerateContentInput): string {
  switch (input.type) {
    case "listing_full":
    case "listing_short":
    case "portal":
    case "website":
      return buildListingInstructions(input.type);
    case "instagram":
    case "facebook":
    case "linkedin":
    case "tiktok":
      return buildSocialInstructions(input.type);
    case "video_script":
      return buildVideoScriptInstructions(input.angle, input.duration);
  }
}

export interface GeneratedContentResult {
  data: unknown;
  promptVersion: number;
  model: string;
}

export class AIService {
  static async generateContent(input: GenerateContentInput): Promise<GeneratedContentResult> {
    const schema = schemaForType(input.type);
    const jsonSchema = zodToJsonSchema(schema) as JsonSchemaObject;

    const userPrompt = [
      buildAvailableDataBlock(input.program, input.lot),
      "",
      buildMarketingBlock(input.marketing),
      "",
      "Instructions :",
      buildTypeInstructions(input),
    ].join("\n");

    const messages: Anthropic.MessageParam[] = [{ role: "user", content: userPrompt }];

    const firstRaw = await callWithForcedTool(messages, jsonSchema);
    const firstAttempt = schema.safeParse(firstRaw);
    if (firstAttempt.success) {
      return { data: firstAttempt.data, promptVersion: input.promptVersion ?? PROMPT_VERSION, model: DEFAULT_MODEL };
    }

    // Sortie invalide : un seul retry automatique avant de remonter l'erreur à l'appelant
    // plutôt que d'afficher un contenu potentiellement mal formé au promoteur.
    const retryRaw = await callWithForcedTool(messages, jsonSchema);
    const retryAttempt = schema.safeParse(retryRaw);
    if (retryAttempt.success) {
      return { data: retryAttempt.data, promptVersion: input.promptVersion ?? PROMPT_VERSION, model: DEFAULT_MODEL };
    }

    throw new AIGenerationError(
      `Sortie IA invalide après retry pour le type "${input.type}": ${retryAttempt.error.message}`
    );
  }
}

async function callWithForcedTool(messages: Anthropic.MessageParam[], jsonSchema: JsonSchemaObject): Promise<unknown> {
  const response = await getClient().messages.create({
    model: DEFAULT_MODEL,
    max_tokens: 2048,
    system: buildSystemPrompt(),
    messages,
    tools: [
      {
        name: TOOL_NAME,
        description: "Retourne le contenu généré au format structuré attendu.",
        input_schema: jsonSchema,
      },
    ],
    tool_choice: { type: "tool", name: TOOL_NAME },
  });

  const toolUse = response.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new AIGenerationError("Le modèle n'a pas retourné d'appel d'outil");
  }

  return toolUse.input;
}
