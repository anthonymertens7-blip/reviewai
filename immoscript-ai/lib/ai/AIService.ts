import Anthropic from "@anthropic-ai/sdk";
import { zodToJsonSchema } from "zod-to-json-schema";
import type { z } from "zod";
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

    const firstToolUse = await callWithForcedTool(messages, jsonSchema);
    const firstAttempt = schema.safeParse(firstToolUse.input);
    if (firstAttempt.success) {
      return { data: firstAttempt.data, promptVersion: input.promptVersion ?? PROMPT_VERSION, model: DEFAULT_MODEL };
    }
    console.error(`[AIService] Sortie IA invalide (1er essai) pour "${input.type}":`, firstAttempt.error.message);

    // Retry corrective : on renvoie au modèle son propre appel invalide accompagné de l'erreur
    // de validation exacte (ex: champ "highlights" manquant), plutôt que de retenter à l'aveugle
    // avec le même prompt — ce qui a le même risque de reproduire la même omission.
    const retryMessages: Anthropic.MessageParam[] = [
      ...messages,
      { role: "assistant", content: [firstToolUse] },
      {
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: firstToolUse.id,
            content: `Réponse invalide : ${firstAttempt.error.message}. Renvoie un appel d'outil complet et valide, avec tous les champs requis.`,
            is_error: true,
          },
        ],
      },
    ];

    const retryToolUse = await callWithForcedTool(retryMessages, jsonSchema);
    const retryAttempt = schema.safeParse(retryToolUse.input);
    if (retryAttempt.success) {
      return { data: retryAttempt.data, promptVersion: input.promptVersion ?? PROMPT_VERSION, model: DEFAULT_MODEL };
    }
    console.error(`[AIService] Sortie IA invalide (retry) pour "${input.type}":`, retryAttempt.error.message);

    // Dernier filet de sécurité : en pratique, le modèle répète parfois la même omission (même champ
    // manquant) malgré le retry correctif ci-dessus. Plutôt que de jeter un contenu par ailleurs
    // valide (titre/description/cta déjà bien ancrés dans les données du bien) après deux appels IA
    // facturés, on demande une génération ciblée des seuls champs manquants.
    const repaired = await repairMissingFields(retryToolUse.input, retryAttempt.error, schema);
    if (repaired) {
      return { data: repaired, promptVersion: input.promptVersion ?? PROMPT_VERSION, model: DEFAULT_MODEL };
    }

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

/**
 * Répare une sortie IA invalide en ne redemandant que les champs requis manquants, à partir du
 * contenu déjà généré (par ailleurs valide). Ne s'applique que si TOUTES les erreurs de validation
 * sont des champs top-level manquants — un autre type d'erreur (mauvais format sur un champ déjà
 * présent) indique un problème plus profond qu'une simple omission, donc pas de réparation.
 */
async function repairMissingFields(
  partial: unknown,
  error: z.ZodError,
  schema: z.ZodTypeAny
): Promise<unknown | null> {
  if (typeof partial !== "object" || partial === null) {
    return null;
  }

  const missingFields = [
    ...new Set(
      error.issues
        .filter((issue) => issue.code === "invalid_type" && issue.received === "undefined" && issue.path.length === 1)
        .map((issue) => String(issue.path[0]))
    ),
  ];

  if (missingFields.length === 0 || missingFields.length !== error.issues.length) {
    return null;
  }

  const fullJsonSchema = zodToJsonSchema(schema) as JsonSchemaObject;
  const properties = (fullJsonSchema.properties ?? {}) as Record<string, unknown>;
  const repairJsonSchema: JsonSchemaObject = {
    type: "object",
    properties: Object.fromEntries(missingFields.map((field) => [field, properties[field]])),
    required: missingFields,
  };

  const repairPrompt = [
    "Voici un contenu déjà rédigé et validé :",
    JSON.stringify(partial, null, 2),
    "",
    `Il manque le(s) champ(s) suivant(s) : ${missingFields.join(", ")}.`,
    "Génère uniquement ce(s) champ(s) manquant(s), strictement basé(s) sur les informations déjà " +
      "présentes ci-dessus (n'invente aucune information nouvelle).",
  ].join("\n");

  try {
    const repairToolUse = await callWithForcedTool([{ role: "user", content: repairPrompt }], repairJsonSchema);
    const merged = { ...(partial as Record<string, unknown>), ...(repairToolUse.input as Record<string, unknown>) };
    const finalAttempt = schema.safeParse(merged);
    if (finalAttempt.success) {
      return finalAttempt.data;
    }
    console.error("[AIService] Réparation des champs manquants toujours invalide :", finalAttempt.error.message);
    return null;
  } catch (repairError) {
    console.error("[AIService] Échec de la réparation des champs manquants :", repairError);
    return null;
  }
}

async function callWithForcedTool(
  messages: Anthropic.MessageParam[],
  jsonSchema: JsonSchemaObject
): Promise<Anthropic.ToolUseBlock> {
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
        description:
          "Retourne le contenu généré au format structuré attendu. Tous les champs du schéma sont " +
          "obligatoires et doivent être renseignés, y compris les champs de type tableau (listes) : " +
          "ne jamais omettre ou laisser vide un champ liste (ex: highlights, hashtags, scenes).",
        input_schema: jsonSchema,
      },
    ],
    tool_choice: { type: "tool", name: TOOL_NAME },
  });

  const toolUse = response.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new AIGenerationError("Le modèle n'a pas retourné d'appel d'outil");
  }

  return toolUse;
}
