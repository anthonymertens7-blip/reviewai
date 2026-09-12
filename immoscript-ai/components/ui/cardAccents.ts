export type CardAccent = "brand" | "teal" | "violet" | "amber" | "rose";

// Teintes pastel (fond -50, icône -600) en harmonie avec le dégradé cyan/bleu ciel du fond.
// "brand" reste la teinte de base (identique au bleu de marque) ; les autres apportent de la
// variété sans être trop saturées, avec des variantes sombres via les palettes Tailwind complètes.
export const CARD_ACCENT_CLASSES: Record<CardAccent, string> = {
  brand: "bg-brand-50 text-brand-600 dark:bg-gray-700",
  teal: "bg-teal-50 text-teal-600 dark:bg-teal-900/40 dark:text-teal-300",
  violet: "bg-violet-50 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300",
  rose: "bg-rose-50 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300",
};
