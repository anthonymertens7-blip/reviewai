"use client";

import { useEffect, useRef } from "react";

/** Redimensionne un textarea à la hauteur de son contenu à chaque changement de valeur. */
export function useAutoGrowTextarea(value: string) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return ref;
}
