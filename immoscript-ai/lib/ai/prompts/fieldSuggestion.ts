import { omitEmpty } from "../serialize";

export const SUGGESTIBLE_FIELDS = [
  "environment",
  "transport",
  "schools",
  "shops",
  "pointsOfInterest",
  "features",
  "advantages",
] as const;
export type SuggestibleField = (typeof SUGGESTIBLE_FIELDS)[number];

export interface SuggestionContext {
  address: string;
  city: string;
  district?: string;
  programType?: string;
  unitsCount?: string;
  deliveryDate?: string;
  environment?: string;
  transport?: string;
  schools?: string;
  shops?: string;
  pointsOfInterest?: string;
  amenities?: string;
}

const LOCATION_FIELDS: SuggestibleField[] = ["environment", "transport", "schools", "shops", "pointsOfInterest"];

const FIELD_INSTRUCTIONS: Record<SuggestibleField, string> = {
  environment: "Décris en 2 à 4 courtes suggestions le type d'environnement/quartier probable à cette adresse (ambiance, type de quartier).",
  transport:
    "Décris en 2 à 4 courtes suggestions le type de desserte en transports en commun probable à cette adresse " +
    "(bus, métro, tram, gare) SANS nommer de ligne ou d'arrêt précis, sauf certitude raisonnable qu'il dessert " +
    "réellement cette adresse.",
  schools: "Suggère 2 à 4 écoles ou établissements scolaires probablement à proximité de cette adresse.",
  shops: "Suggère 2 à 4 commerces ou commodités probablement à proximité de cette adresse.",
  pointsOfInterest:
    "Décris en 2 à 4 courtes suggestions le type de points d'intérêt probablement à proximité de cette adresse " +
    "(espaces verts, équipements...) SANS nommer de parc, monument ou lieu précis, sauf certitude raisonnable " +
    "qu'il est réellement proche de cette adresse.",
  features: "Suggère 2 à 4 caractéristiques commerciales à mettre en avant pour ce programme (ce qui le distingue concrètement).",
  advantages: "Suggère 2 à 4 avantages commerciaux à mettre en avant pour ce programme (bénéfices concrets pour un acheteur/locataire).",
};

export function buildFieldSuggestionPrompt(context: SuggestionContext, field: SuggestibleField): string {
  const isLocationField = LOCATION_FIELDS.includes(field);
  const lines = [`Adresse : ${context.address}`, `Ville : ${context.city}`];

  // Le quartier était silencieusement omis du prompt (seules adresse+ville y figuraient) : sans
  // lui, le modèle décrivait parfois les quartiers les plus "connus" de la ville plutôt que celui
  // réellement indiqué (ex: Villejean/CHU Pontchaillou suggérés pour une adresse à Bréquigny, deux
  // quartiers de Rennes opposés géographiquement).
  if (context.district) {
    lines.push(`Quartier : ${context.district}`);
  }

  if (!isLocationField) {
    const known = omitEmpty(context as unknown as Record<string, unknown>);
    lines.push("", "Autres informations déjà renseignées sur ce programme :", JSON.stringify(known, null, 2));
  }

  lines.push("", FIELD_INSTRUCTIONS[field], "");

  if (isLocationField) {
    lines.push(
      "Reste généraliste et prudent par défaut : ne nomme un élément précis (ligne de transport, arrêt,",
      "établissement, parc, monument, quartier voisin...) que si tu es raisonnablement certain qu'il",
      "concerne réellement cette adresse précise. Dans le doute, privilégie une description générique",
      '(ex : "bien desservi par les transports en commun", "commerces de proximité", "espaces verts à',
      'proximité") plutôt qu\'un nom précis potentiellement erroné : une suggestion générique mais',
      "juste vaut mieux qu'une suggestion précise mais fausse.",
      "Reste strictement dans le quartier/secteur indiqué ci-dessus : ne mentionne pas un autre",
      "quartier de la même ville, même connu ou emblématique, s'il n'est pas réellement à proximité",
      "immédiate de cette adresse précise."
    );
  } else {
    lines.push(
      "Base-toi uniquement sur les informations déjà renseignées ci-dessus (localisation, environnement,",
      "transports, date de livraison, type de bien...) pour suggérer des arguments plausibles.",
      "N'invente aucune caractéristique qui ne découle pas de ces données."
    );
  }

  lines.push("Réponds uniquement via l'outil fourni, chaque suggestion étant une courte expression autonome.");
  return lines.join("\n");
}
