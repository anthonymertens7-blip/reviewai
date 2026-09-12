export type CardAccent = "brand" | "teal" | "violet" | "amber" | "rose" | "indigo";

// Teintes pastel (fond de carte + badge d'icône) en harmonie avec le dégradé cyan/bleu ciel
// du fond. Le badge reste blanc (chip) pour se détacher du fond de carte teinté.
export const CARD_ACCENT_STYLES: Record<CardAccent, { card: string; badge: string }> = {
  brand: {
    card: "bg-brand-100 border-brand-200 dark:bg-gray-800 dark:border-gray-700",
    badge: "bg-white text-brand-600 dark:bg-gray-700 dark:text-brand-300",
  },
  teal: {
    card: "bg-teal-100 border-teal-200 dark:bg-teal-950/40 dark:border-teal-900/60",
    badge: "bg-white text-teal-600 dark:bg-gray-800 dark:text-teal-300",
  },
  violet: {
    card: "bg-violet-100 border-violet-200 dark:bg-violet-950/40 dark:border-violet-900/60",
    badge: "bg-white text-violet-600 dark:bg-gray-800 dark:text-violet-300",
  },
  amber: {
    card: "bg-amber-100 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900/60",
    badge: "bg-white text-amber-600 dark:bg-gray-800 dark:text-amber-300",
  },
  rose: {
    card: "bg-rose-100 border-rose-200 dark:bg-rose-950/40 dark:border-rose-900/60",
    badge: "bg-white text-rose-600 dark:bg-gray-800 dark:text-rose-300",
  },
  indigo: {
    card: "bg-indigo-100 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-900/60",
    badge: "bg-white text-indigo-600 dark:bg-gray-800 dark:text-indigo-300",
  },
};
