import Anthropic from "@anthropic-ai/sdk";
import { zodToJsonSchema } from "zod-to-json-schema";
import type { GenerateContentInput } from "./types";
import { schemaForType, fieldSuggestionSchema } from "./schemas";
import { buildAvailableDataBlock, buildMarketingBlock, buildSystemPrompt, PROMPT_VERSION } from "./prompts/system";
import { buildListingInstructions } from "./prompts/listing";
import { buildSocialInstructions } from "./prompts/social";
import { buildVideoScriptInstructions } from "./prompts/videoScript";
import { buildFieldSuggestionPrompt, type SuggestibleField, type SuggestionContext } from "./prompts/fieldSuggestion";

const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5";
const TOOL_NAME = "return_generated_content";
const SUGGESTION_TOOL_NAME = "return_field_suggestions";

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
    console.error(`[AIService] Sortie IA invalide (1er essai) pour "${input.type}":`, firstAttempt.error.message);

    // Sortie invalide : un seul retry automatique avant de remonter l'erreur à l'appelant
    // plutôt que d'afficher un contenu potentiellement mal formé au promoteur.
    const retryRaw = await callWithForcedTool(messages, jsonSchema);
    const retryAttempt = schema.safeParse(retryRaw);
    if (retryAttempt.success) {
      return { data: retryAttempt.data, promptVersion: input.promptVersion ?? PROMPT_VERSION, model: DEFAULT_MODEL };
    }
    console.error(`[AIService] Sortie IA invalide (retry) pour "${input.type}":`, retryAttempt.error.message);

    throw new AIGenerationError(
      `Sortie IA invalide après retry pour le type "${input.type}": ${retryAttempt.error.message}`
    );
  }

  /**
   * Suggère rapidement quelques idées (transports, écoles, commerces...) à partir d'une
   * adresse, pour pré-remplir un champ du formulaire programme. Contrairement à
   * generateContent, ce n'est pas du contenu publié tel quel : l'utilisateur reste libre
   * de corriger avant de sauvegarder, donc un prompt basé sur la connaissance générale du
   * modèle (avec consigne de rester prudent) est acceptable ici.
   */
  static async suggestField(context: SuggestionContext, field: SuggestibleField): Promise<string[]> {
    const jsonSchema = zodToJsonSchema(fieldSuggestionSchema) as JsonSchemaObject;
    const prompt = buildFieldSuggestionPrompt(context, field);

    const response = await getClient().messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 512,
      system:
        "Tu aides un promoteur immobilier à pré-remplir rapidement une fiche programme à partir d'une adresse. " +
        "Reste réaliste et prudent : dans le doute, reste générique plutôt que d'inventer un nom propre.",
      messages: [{ role: "user", content: prompt }],
      tools: [
        {
          name: SUGGESTION_TOOL_NAME,
          description: "Retourne les suggestions.",
          input_schema: jsonSchema,
        },
      ],
      tool_choice: { type: "tool", name: SUGGESTION_TOOL_NAME },
    });

    const toolUse = response.content.find((block) => block.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      throw new AIGenerationError("Le modèle n'a pas retourné d'appel d'outil");
    }

    const parsed = fieldSuggestionSchema.safeParse(toolUse.input);
    if (!parsed.success) {
      throw new AIGenerationError(`Sortie IA invalide pour la suggestion de champ : ${parsed.error.message}`);
    }

    return parsed.data.suggestions;
  }

  /**
   * Décrit un lot à partir de ses photos réelles : contrairement à
   * generateContent (données déclarées) ou suggestField (connaissance
   * générale), l'ancrage ici est visuel — le modèle ne doit lister que ce
   * qui apparaît effectivement sur au moins une photo fournie.
   */
  static async suggestFromPhotos(photos: { data: Uint8Array; mimeType: string }[]): Promise<string[]> {
    const jsonSchema = zodToJsonSchema(fieldSuggestionSchema) as JsonSchemaObject;

    const imageBlocks: Anthropic.ImageBlockParam[] = photos.map((photo) => ({
      type: "image",
      source: {
        type: "base64",
        media_type: photo.mimeType as "image/jpeg" | "image/png" | "image/webp",
        data: Buffer.from(photo.data).toString("base64"),
      },
    }));

    const response = await getClient().messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 512,
      system:
        "Tu décris un bien immobilier à partir de photos fournies par un promoteur. " +
        "RÈGLE ABSOLUE : tu ne listes que ce qui est clairement visible sur au moins une photo " +
        "(matériaux, agencement, luminosité, équipements visibles...). Tu n'inventes jamais une pièce, " +
        "un équipement ou une caractéristique que tu ne peux pas voir. Dans le doute, tu n'en parles pas.",
      messages: [
        {
          role: "user",
          content: [
            ...imageBlocks,
            { type: "text", text: "Liste les caractéristiques concrètes visibles sur ces photos (3 à 6 éléments courts)." },
          ],
        },
      ],
      tools: [
        {
          name: SUGGESTION_TOOL_NAME,
          description: "Retourne les caractéristiques observées.",
          input_schema: jsonSchema,
        },
      ],
      tool_choice: { type: "tool", name: SUGGESTION_TOOL_NAME },
    });

    const toolUse = response.content.find((block) => block.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      throw new AIGenerationError("Le modèle n'a pas retourné d'appel d'outil");
    }

    const parsed = fieldSuggestionSchema.safeParse(toolUse.input);
    if (!parsed.success) {
      throw new AIGenerationError(`Sortie IA invalide pour la description depuis photos : ${parsed.error.message}`);
    }

    return parsed.data.suggestions;
  }
}

async function callWithForcedTool(messages: Anthropic.MessageParam[], jsonSchema: JsonSchemaObject): Promise<unknown> {
  const response = await getClient().messages.create({
    model: DEFAULT_MODEL,
    // 2048 s'est révélé insuffisant pour une annonce longue (250-400 mots) ou un script vidéo à
    // plusieurs scènes : le JSON de l'appel d'outil est alors tronqué avant la fin, donc invalide.
    max_tokens: 4096,
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
