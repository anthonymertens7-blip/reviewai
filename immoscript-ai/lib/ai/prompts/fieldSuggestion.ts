export const SUGGESTIBLE_FIELDS = ["environment", "transport", "schools", "shops", "pointsOfInterest"] as const;
export type SuggestibleField = (typeof SUGGESTIBLE_FIELDS)[number];

const FIELD_INSTRUCTIONS: Record<SuggestibleField, string> = {
  environment: "Décris en 2 à 4 courtes suggestions le type d'environnement/quartier probable à cette adresse (ambiance, type de quartier).",
  transport: "Suggère 2 à 4 transports en commun probablement accessibles à pied depuis cette adresse (bus, métro, tram, gare).",
  schools: "Suggère 2 à 4 écoles ou établissements scolaires probablement à proximité de cette adresse.",
  shops: "Suggère 2 à 4 commerces ou commodités probablement à proximité de cette adresse.",
  pointsOfInterest: "Suggère 2 à 4 points d'intérêt (parcs, monuments, lieux notables) probablement à proximité de cette adresse.",
};

export function buildFieldSuggestionPrompt(address: string, field: SuggestibleField): string {
  return [
    `Adresse : ${address}`,
    "",
    FIELD_INSTRUCTIONS[field],
    "",
    "Base-toi sur ta connaissance générale du lieu. Si tu n'es pas certain d'un nom précis,",
    'reste générique (ex : "commerces de proximité" plutôt qu\'un nom de magasin inventé).',
    "Réponds uniquement via l'outil fourni, chaque suggestion étant une courte expression autonome.",
  ].join("\n");
}
