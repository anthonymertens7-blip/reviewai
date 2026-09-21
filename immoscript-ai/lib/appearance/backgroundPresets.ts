// Source unique des couleurs de fond disponibles — importé à la fois côté client
// (lib/useBackgroundPreset.ts) et côté serveur (validation de l'API de préférences),
// donc sans directive "use client" ici.
export const BACKGROUND_PRESET_IDS = ["cyan", "violet", "rose", "vert", "neutre"] as const;
export type BackgroundPresetId = (typeof BACKGROUND_PRESET_IDS)[number];

export const BACKGROUND_PRESETS = [
  { id: "cyan", label: "Cyan (défaut)", swatch: "linear-gradient(135deg, #E3FBFF, #7FD9EC)" },
  { id: "violet", label: "Violet", swatch: "linear-gradient(135deg, #F3E8FF, #C4B5FD)" },
  { id: "rose", label: "Rose", swatch: "linear-gradient(135deg, #FFE4E9, #FDA4C0)" },
  { id: "vert", label: "Vert d'eau", swatch: "linear-gradient(135deg, #ECFDF5, #6EE7B7)" },
  { id: "neutre", label: "Neutre", swatch: "linear-gradient(135deg, #F8FAFC, #CBD5E1)" },
] satisfies { id: BackgroundPresetId; label: string; swatch: string }[];

export function isBackgroundPresetId(value: string): value is BackgroundPresetId {
  return (BACKGROUND_PRESET_IDS as readonly string[]).includes(value);
}
