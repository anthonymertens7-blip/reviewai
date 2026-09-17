import type { ContentType } from "@/lib/ai/types";

// Palette catégorielle validée (skill dataviz — ordre garant de la distinguabilité CVD, voir
// references/palette.md) : ne jamais réordonner ni cycler au-delà des 8 teintes définies ici.
//
// Les classes Tailwind ci-dessous sont écrites en toutes lettres (littéraux) exprès : le scanner
// JIT de Tailwind extrait les classes par recherche de motif dans le texte brut des fichiers, pas
// par évaluation JS — une classe reconstruite dynamiquement à partir d'un hex calculé à l'exécution
// (ex. `bg-[${hex}]`) ne serait jamais générée en build. En les gardant ici comme chaînes
// littérales complètes, elles sont bien détectées même si le code ne fait qu'indexer ce tableau.
const CATEGORICAL_SLOTS = [
  { bg: "bg-[#2a78d6] dark:bg-[#3987e5]", text: "text-[#2a78d6] dark:text-[#3987e5]" }, // 1 bleu
  { bg: "bg-[#eb6834] dark:bg-[#d95926]", text: "text-[#eb6834] dark:text-[#d95926]" }, // 2 orange
  { bg: "bg-[#1baf7a] dark:bg-[#199e70]", text: "text-[#1baf7a] dark:text-[#199e70]" }, // 3 aqua
  { bg: "bg-[#eda100] dark:bg-[#c98500]", text: "text-[#eda100] dark:text-[#c98500]" }, // 4 jaune
  { bg: "bg-[#e87ba4] dark:bg-[#d55181]", text: "text-[#e87ba4] dark:text-[#d55181]" }, // 5 magenta
  { bg: "bg-[#008300] dark:bg-[#008300]", text: "text-[#008300] dark:text-[#008300]" }, // 6 vert
  { bg: "bg-[#4a3aa7] dark:bg-[#9085e9]", text: "text-[#4a3aa7] dark:text-[#9085e9]" }, // 7 violet
  { bg: "bg-[#e34948] dark:bg-[#e66767]", text: "text-[#e34948] dark:text-[#e66767]" }, // 8 rouge
] as const;

const OTHER_SLOT = { bg: "bg-gray-400 dark:bg-gray-500", text: "text-gray-400 dark:text-gray-500" };

// Assignation fixe type -> emplacement de couleur : l'identité (un type = une couleur) ne doit
// jamais dépendre du classement/tri du moment (règle "color follows the entity, never its rank").
const CONTENT_TYPE_SLOT_INDEX: Record<ContentType, number> = {
  listing_full: 0,
  instagram: 1,
  listing_short: 2,
  tiktok: 3,
  portal: 4,
  facebook: 5,
  video_script: 6,
  website: 7,
  linkedin: 7, // au-delà de 8 identités réelles distinctes affichées simultanément, peu probable en pratique
};

export function contentTypeColorClasses(type: ContentType | "autres"): { bg: string; text: string } {
  if (type === "autres") return OTHER_SLOT;
  return CATEGORICAL_SLOTS[CONTENT_TYPE_SLOT_INDEX[type] ?? 0] ?? CATEGORICAL_SLOTS[0];
}

// Statuts de validation : réutilise exactement les couleurs déjà établies dans ContentCard
// (APPROVAL_LABELS) pour rester cohérent avec le reste de l'app plutôt que d'inventer un nouveau
// jeu de couleurs de statut.
export const APPROVAL_COLOR_CLASSES: Record<"draft" | "pending_review" | "approved", { bg: string; text: string }> = {
  draft: { bg: "bg-gray-300 dark:bg-gray-600", text: "text-gray-500 dark:text-gray-400" },
  pending_review: { bg: "bg-amber-500 dark:bg-amber-400", text: "text-amber-700 dark:text-amber-300" },
  approved: { bg: "bg-teal-500 dark:bg-teal-400", text: "text-teal-700 dark:text-teal-300" },
};
