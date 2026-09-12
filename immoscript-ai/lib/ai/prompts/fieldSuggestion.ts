export const SUGGESTIBLE_FIELDS = ["environment", "transport", "schools", "shops", "pointsOfInterest"] as const;
export type SuggestibleField = (typeof SUGGESTIBLE_FIELDS)[number];

const FIELD_INSTRUCTIONS: Record<SuggestibleField, string> = {
  environment: "Décris en 2 à 4 courtes suggestions le type d'environnement/quartier probable à cette adresse (ambiance, type de quartier).",
  transport: "Suggère 2 à 4 transports en commun probablement accessibles à pied depuis cette adresse (lignes de bus/métro/tram réelles si tu les connais, gare).",
  schools: "Suggère 2 à 4 écoles ou établissements scolaires probablement à proximité de cette adresse.",
  shops: "Suggère 2 à 4 commerces ou commodités probablement à proximité de cette adresse.",
  pointsOfInterest: "Suggère 2 à 4 points d'intérêt (parcs, monuments, lieux notables) probablement à proximité de cette adresse.",
};

export function buildFieldSuggestionPrompt(address: string, city: string, field: SuggestibleField): string {
  return [
    `Adresse : ${address}`,
    `Ville : ${city}`,
    "",
    FIELD_INSTRUCTIONS[field],
    "",
    "Utilise ta connaissance réelle de cette ville et de ce quartier pour être aussi concret que",
    "possible (vrais noms de lignes de transport, de quartiers, de lieux connus) plutôt que de",
    "rester vague par défaut. N'invente en revanche jamais un nom précis d'établissement (école,",
    "commerce...) dont tu n'es pas raisonnablement sûr : dans ce cas seulement, reste générique",
    '(ex : "commerces de proximité").',
    "Réponds uniquement via l'outil fourni, chaque suggestion étant une courte expression autonome.",
  ].join("\n");
}
