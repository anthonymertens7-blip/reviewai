export const VARIANT_TONE_PRESETS = ["Sobre et factuel", "Chaleureux et accessible", "Premium et exclusif"] as const;

export type VariantsCount = 1 | 2 | 3;

/** Combine le ton choisi par l'utilisateur (s'il existe) avec la nuance de la variante, pour des versions vraiment distinctes à comparer en A/B. */
export function toneForVariant(baseTone: string | undefined, variantIndex: 0 | 1 | 2): string {
  const preset = VARIANT_TONE_PRESETS[variantIndex];
  return baseTone ? `${baseTone} — nuance "${preset}"` : preset;
}
