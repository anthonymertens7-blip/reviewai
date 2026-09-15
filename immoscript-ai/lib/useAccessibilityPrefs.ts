"use client";

import { useCallback, useEffect, useState } from "react";

export type FontSize = "normal" | "large" | "xlarge";

export interface AccessibilityPrefs {
  highContrast: boolean;
  fontSize: FontSize;
  reduceMotion: boolean;
}

const DEFAULT_PREFS: AccessibilityPrefs = { highContrast: false, fontSize: "normal", reduceMotion: false };
const STORAGE_KEY = "immoscript-a11y";

function applyPrefs(prefs: AccessibilityPrefs) {
  const root = document.documentElement;
  if (prefs.highContrast) {
    root.setAttribute("data-contrast", "high");
  } else {
    root.removeAttribute("data-contrast");
  }

  if (prefs.fontSize !== "normal") {
    root.setAttribute("data-font-size", prefs.fontSize);
  } else {
    root.removeAttribute("data-font-size");
  }

  if (prefs.reduceMotion) {
    root.setAttribute("data-reduce-motion", "true");
  } else {
    root.removeAttribute("data-reduce-motion");
  }
}

export function useAccessibilityPrefs() {
  const [prefs, setPrefsState] = useState<AccessibilityPrefs>(DEFAULT_PREFS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setPrefsState({ ...DEFAULT_PREFS, ...JSON.parse(raw) });
    } catch {
      // localStorage indisponible : préférences par défaut pour la session en cours
    }
  }, []);

  const update = useCallback((patch: Partial<AccessibilityPrefs>) => {
    setPrefsState((prev) => {
      const next = { ...prev, ...patch };
      applyPrefs(next);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // localStorage indisponible : préférences appliquées mais non persistées
      }
      return next;
    });
  }, []);

  return { prefs, update };
}
