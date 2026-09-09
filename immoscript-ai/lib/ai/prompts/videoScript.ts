import type { VideoAngle, VideoDuration } from "../types";

const ANGLE_INSTRUCTIONS: Record<VideoAngle, string> = {
  emotion: "Angle émotion : mise en scène du cadre de vie, du ressenti d'habiter le bien.",
  investissement: "Angle investissement : rendement, fiscalité, valorisation, données chiffrées.",
  visite: "Angle visite guidée : parcours pièce par pièce, comme une visite commentée.",
  storytelling: "Angle storytelling : une histoire courte (une journée type, un moment de vie).",
  urgence: "Angle urgence : rareté, dernières unités disponibles, appel à l'action fort.",
};

export function buildVideoScriptInstructions(angle: VideoAngle | undefined, duration: VideoDuration | undefined): string {
  const angleInstruction = angle ? ANGLE_INSTRUCTIONS[angle] : "Choisis l'angle narratif le plus pertinent au vu des données disponibles.";
  const durationInstruction = duration
    ? `Le script doit durer exactement ${duration} secondes au total (somme des durées de chaque scène).`
    : "Le script doit durer entre 30 et 45 secondes au total.";

  return [
    "Rédige un script vidéo scène par scène pour une vidéo courte (réseaux sociaux).",
    angleInstruction,
    durationInstruction,
    "Chaque scène doit préciser : la plage de temps (time, ex: \"0-3\"), la description du visuel (visual),",
    "le texte de la voix off (voiceover), et le texte incrusté à l'écran s'il y en a (textOverlay, chaîne vide sinon).",
    "Le script doit aussi inclure une accroche (hook) dans les 3 premières secondes et un appel à l'action final (cta).",
  ].join("\n");
}
