"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

const DURATION_MS = 900;

// Anime le chiffre de 0 à sa valeur finale à l'apparition — c'est ce qui rend une tuile de stat
// "vivante" au chargement, pas juste un nombre statique. Se désactive proprement si l'utilisateur
// a demandé de réduire les animations (réglage app ou préférence système).
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function AnimatedNumber({ value, format }: { value: number; format?: (n: number) => string }) {
  const reduceMotion = usePrefersReducedMotion();
  const [display, setDisplay] = useState(reduceMotion ? value : 0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (reduceMotion) {
      setDisplay(value);
      return;
    }

    const start = performance.now();
    function tick(now: number) {
      const progress = Math.min(1, (now - start) / DURATION_MS);
      setDisplay(Math.round(value * easeOutCubic(progress)));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    }
    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, reduceMotion]);

  return <span className="tabular-nums">{format ? format(display) : display.toLocaleString("fr-FR")}</span>;
}
