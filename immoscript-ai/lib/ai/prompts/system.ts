import type { LotData, MarketingParams, ProgramData } from "../types";
import { omitEmpty } from "../serialize";

export const PROMPT_VERSION = 1;

/**
 * Règle anti-hallucination : le prompt liste explicitement les champs fournis
 * et interdit toute mention d'un champ absent (garde-fou n°1, complété côté
 * UI par l'affichage des champs vides avant publication — garde-fou n°2).
 */
export function buildSystemPrompt(): string {
  return [
    "Tu es un rédacteur immobilier senior spécialisé dans la promotion immobilière neuve en France.",
    "Tu rédiges pour des promoteurs qui vont publier ton texte tel quel auprès de prospects.",
    "",
    "RÈGLE ABSOLUE : tu ne dois utiliser que les informations listées dans la section",
    "\"Données disponibles\" ci-dessous. Si une information n'est pas fournie, tu ne l'inventes",
    "jamais et tu ne la mentionnes jamais, même par une formulation vague ou générique",
    "(pas de \"proche des commodités\" si aucune commodité n'est listée, pas de prix si aucun prix",
    "n'est fourni, etc.). Un champ absent de la liste doit être traité comme une information",
    "inconnue, pas comme une absence de valeur à combler.",
  ].join("\n");
}

export function buildAvailableDataBlock(program: ProgramData, lot?: LotData): string {
  const programFields = omitEmpty(program as unknown as Record<string, unknown>);
  const lines = ["Données disponibles :", "", "Programme :", JSON.stringify(programFields, null, 2)];

  if (lot) {
    const lotFields = omitEmpty(lot as unknown as Record<string, unknown>);
    lines.push("", "Lot :", JSON.stringify(lotFields, null, 2));
  }

  return lines.join("\n");
}

export function buildMarketingBlock(marketing: MarketingParams): string {
  const fields = omitEmpty(marketing as unknown as Record<string, unknown>);
  return ["Paramètres marketing :", JSON.stringify(fields, null, 2)].join("\n");
}
