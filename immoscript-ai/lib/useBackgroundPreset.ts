"use client";

import { useCallback, useEffect, useState } from "react";
import { BACKGROUND_PRESETS, type BackgroundPresetId } from "@/lib/appearance/backgroundPresets";

export { BACKGROUND_PRESETS };
export type { BackgroundPresetId };

const STORAGE_KEY = "immoscript-bg";
const DEFAULT_PRESET: BackgroundPresetId = "cyan";

export function useBackgroundPreset() {
  const [preset, setPresetState] = useState<BackgroundPresetId>(DEFAULT_PRESET);

  useEffect(() => {
    const attr = document.documentElement.getAttribute("data-bg") as BackgroundPresetId | null;
    setPresetState(attr ?? DEFAULT_PRESET);
  }, []);

  const setPreset = useCallback((next: BackgroundPresetId, options?: { persist?: boolean }) => {
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

    // Persiste sur le compte (en base) pour que la préférence suive l'utilisateur d'un appareil/
    // navigateur à l'autre — le localStorage ci-dessus ne couvre que CE navigateur. `persist: false`
    // est utilisé par la resynchronisation au chargement (BackgroundPreferenceSync) pour éviter de
    // renvoyer au serveur la valeur qu'on vient tout juste de lui lire.
    if (options?.persist !== false) {
      fetch("/api/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ backgroundPreset: next }),
      }).catch(() => {
        // Préférence purement esthétique : un échec de synchronisation ne doit pas interrompre
        // l'utilisateur ni afficher d'erreur — le localStorage local reste la source de vérité pour
        // ce navigateur quoi qu'il arrive.
      });
    }
  }, []);

  return { preset, setPreset };
}
