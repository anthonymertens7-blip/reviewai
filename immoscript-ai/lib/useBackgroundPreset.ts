"use client";

import { useCallback, useEffect, useState } from "react";

export const BACKGROUND_PRESETS = [
  { id: "cyan", label: "Cyan (défaut)", swatch: "linear-gradient(135deg, #E3FBFF, #7FD9EC)" },
  { id: "violet", label: "Violet", swatch: "linear-gradient(135deg, #F3E8FF, #C4B5FD)" },
  { id: "rose", label: "Rose", swatch: "linear-gradient(135deg, #FFE4E9, #FDA4C0)" },
  { id: "vert", label: "Vert d'eau", swatch: "linear-gradient(135deg, #ECFDF5, #6EE7B7)" },
  { id: "neutre", label: "Neutre", swatch: "linear-gradient(135deg, #F8FAFC, #CBD5E1)" },
] as const;

export type BackgroundPresetId = (typeof BACKGROUND_PRESETS)[number]["id"];

const STORAGE_KEY = "immoscript-bg";
const DEFAULT_PRESET: BackgroundPresetId = "cyan";

export function useBackgroundPreset() {
  const [preset, setPresetState] = useState<BackgroundPresetId>(DEFAULT_PRESET);

  useEffect(() => {
    const attr = document.documentElement.getAttribute("data-bg") as BackgroundPresetId | null;
    setPresetState(attr ?? DEFAULT_PRESET);
  }, []);

  const setPreset = useCallback((next: BackgroundPresetId) => {
    setPresetState(next);
    if (next === DEFAULT_PRESET) {
      document.documentElement.removeAttribute("data-bg");
    } else {
      document.documentElement.setAttribute("data-bg", next);
    }
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage indisponible (navigation privée...) : le fond reste appliqué pour la session en cours
    }
  }, []);

  return { preset, setPreset };
}
