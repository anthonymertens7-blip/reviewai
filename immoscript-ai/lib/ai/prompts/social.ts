import type { ContentType } from "../types";

const INSTRUCTIONS: Record<"instagram" | "facebook" | "linkedin" | "tiktok", string> = {
  instagram:
    "Rédige une légende Instagram (100 à 150 mots), ton visuel et engageant, emojis avec parcimonie, " +
    "pensée pour accompagner une photo ou une visite virtuelle.",
  facebook:
    "Rédige un post Facebook (80 à 150 mots), ton chaleureux et conversationnel, orienté partage " +
    "et commentaires.",
  linkedin:
    "Rédige un post LinkedIn (100 à 180 mots), ton professionnel, orienté investissement et données " +
    "concrètes plutôt qu'émotion.",
  tiktok:
    "Rédige une légende TikTok courte et percutante (30 à 60 mots), ton direct, adaptée à une " +
    "audience jeune et à un format vidéo court.",
};

export function buildSocialInstructions(type: ContentType): string {
  const instruction = INSTRUCTIONS[type as keyof typeof INSTRUCTIONS];
  return [
    instruction,
    "Le texte doit inclure : la légende (caption) et une liste de hashtags pertinents (hashtags),",
    "sans doublon avec les mots déjà présents dans la légende.",
  ].join("\n");
}
