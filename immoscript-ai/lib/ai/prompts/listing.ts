import type { ContentType } from "../types";

const INSTRUCTIONS: Record<"listing_full" | "listing_short" | "portal" | "website", string> = {
  listing_full:
    "Rédige une annonce longue et détaillée (250 à 400 mots), structurée en paragraphes, " +
    "pour une diffusion sur le site du promoteur ou un mailing.",
  listing_short:
    "Rédige une annonce courte et percutante (80 à 120 mots), pour une diffusion rapide " +
    "(SMS commercial, résumé de fiche).",
  portal:
    "Rédige une annonce au format générique compatible avec les portails immobiliers " +
    "(SeLoger, Bien'ici, Leboncoin) : 500 à 800 caractères, phrases courtes, pas de mise en forme, " +
    "vocabulaire orienté recherche (type de bien, ville, nombre de pièces en premier).",
  website:
    "Rédige un texte de présentation pour une page programme sur le site vitrine du promoteur : " +
    "ton institutionnel, met en avant le positionnement du programme autant que le lot.",
};

export function buildListingInstructions(type: ContentType): string {
  const instruction = INSTRUCTIONS[type as keyof typeof INSTRUCTIONS];
  return [
    instruction,
    "Le texte doit inclure : un titre accrocheur, une description, une liste de points forts (highlights),",
    "et un appel à l'action (cta) cohérent avec l'objectif commercial fourni.",
  ].join("\n");
}
