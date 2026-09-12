export type CardAccent = "brand" | "teal" | "violet" | "amber" | "rose";

// Teintes pastel (fond de carte + badge d'icône) en harmonie avec le dégradé cyan/bleu ciel
// du fond. Le badge reste blanc (chip) pour se détacher du fond de carte teinté.
export const CARD_ACCENT_STYLES: Record<CardAccent, { card: string; badge: string }> = {
  brand: {
    card: "bg-brand-50 border-brand-100 dark:bg-gray-800 dark:border-gray-700",
    badge: "bg-white text-brand-600 dark:bg-gray-700 dark:text-brand-300",
  },
  teal: {
    card: "bg-teal-50 border-teal-100 dark:bg-teal-950/30 dark:border-teal-900/60",
    badge: "bg-white text-teal-600 dark:bg-gray-800 dark:text-teal-300",
  },
  violet: {
    card: "bg-violet-50 border-violet-100 dark:bg-violet-950/30 dark:border-violet-900/60",
    badge: "bg-white text-violet-600 dark:bg-gray-800 dark:text-violet-300",
  },
  amber: {
    card: "bg-amber-50 border-amber-100 dark:bg-amber-950/30 dark:border-amber-900/60",
    badge: "bg-white text-amber-600 dark:bg-gray-800 dark:text-amber-300",
  },
  rose: {
    card: "bg-rose-50 border-rose-100 dark:bg-rose-950/30 dark:border-rose-900/60",
    badge: "bg-white text-rose-600 dark:bg-gray-800 dark:text-rose-300",
  },
};
