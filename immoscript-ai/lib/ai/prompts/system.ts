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

// Liste blanche stricte des champs métier de ProgramData/LotData (voir lib/ai/types.ts). Les
// objets réellement passés ici viennent de ProgramService.get, qui inclut aussi lots/id/
// organizationId/createdAt/updatedAt (relation Prisma + colonnes internes) — le typage TypeScript
// ne protège pas contre ça à l'exécution (JSON.stringify sérialise toutes les propriétés
// présentes, pas seulement celles de l'interface). Sans ce filtrage explicite, une génération
// "programme, aucun lot spécifique" recevait quand même les données de TOUS les lots du programme
// (prix, DPE, référence...) via program.lots, et le modèle pouvait en citer un au hasard comme si
// c'était une caractéristique du programme entier.
const PROGRAM_DATA_FIELDS: (keyof ProgramData)[] = [
  "name", "address", "city", "district", "description", "deliveryDate", "programType",
  "unitsCount", "environment", "transport", "schools", "shops", "pointsOfInterest", "amenities",
  "features", "advantages", "isCoOwnership", "condoLotsCount",
];

const LOT_DATA_FIELDS: (keyof LotData)[] = [
  "reference", "propertyType", "roomsCount", "livingArea", "outdoorArea", "floor", "orientation",
  "exposure", "view", "hasBalcony", "hasTerrace", "hasGarden", "hasParking", "hasCellar",
  "hasEquippedKitchen", "isFurnished", "furnishedEquipment", "dpeEnergyClass", "dpeGesClass",
  "condoAnnualCharges", "price", "pricePerSqm", "availability", "specialFeatures",
];

function pickFields<T extends object>(source: T, fields: (keyof T)[]): Record<string, unknown> {
  const picked: Record<string, unknown> = {};
  for (const field of fields) {
    if (field in source) picked[field as string] = source[field];
  }
  return picked;
}

export function buildAvailableDataBlock(program: ProgramData, lot?: LotData): string {
  const programFields = omitEmpty(pickFields(program, PROGRAM_DATA_FIELDS));
  const lines = ["Données disponibles :", "", "Programme :", JSON.stringify(programFields, null, 2)];

  if (lot) {
    const lotFields = omitEmpty(pickFields(lot, LOT_DATA_FIELDS));
    lines.push("", "Lot :", JSON.stringify(lotFields, null, 2));
  }

  return lines.join("\n");
}

export function buildMarketingBlock(marketing: MarketingParams): string {
  const fields = omitEmpty(marketing as unknown as Record<string, unknown>);
  return ["Paramètres marketing :", JSON.stringify(fields, null, 2)].join("\n");
}
