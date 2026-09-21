"use client";

import { useEffect } from "react";
import { useBackgroundPreset } from "@/lib/useBackgroundPreset";
import { isBackgroundPresetId } from "@/lib/appearance/backgroundPresets";

/**
 * Resynchronise la couleur de fond depuis le compte (base de données) au chargement — le
 * localStorage appliqué par le script inline de app/layout.tsx ne couvre que CE navigateur, donc
 * sur un nouvel appareil/navigateur (ou après un nettoyage des données du site), c'est cette
 * synchronisation qui fait suivre la préférence enregistrée sur le compte. `persist: false` évite
 * de renvoyer immédiatement au serveur la valeur qu'on vient tout juste de lui lire.
 */
export function BackgroundPreferenceSync({ storedPreset }: { storedPreset: string | null }) {
  const { preset, setPreset } = useBackgroundPreset();

  useEffect(() => {
    if (storedPreset && isBackgroundPresetId(storedPreset) && storedPreset !== preset) {
      setPreset(storedPreset, { persist: false });
    }
    // Uniquement au montage, avec la valeur serveur reçue à ce chargement — pas à chaque
    // changement local de `preset` (sinon ce même effect re-déclencherait setPreset en boucle).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storedPreset]);

  return null;
}
