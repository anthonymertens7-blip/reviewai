"use client";

import { useId } from "react";

/**
 * Tourbillon : 4 pales incurvées en spirale autour d'un noyau, sur fond dégradé — même dégradé
 * que le fond de l'app (--bg-from/--bg-to en mode clair, voir app/globals.css). Un seul mark
 * réutilisé partout (favicon, en-tête public, sidebar) plutôt qu'un simple monogramme.
 */
export function LogoMark({ size = 36, className }: { size?: number; className?: string }) {
  const gradientId = useId();
  const blade = "M48 48 C40 34 42 18 58 12 C70 8 80 16 78 28 C76 38 64 46 48 48 Z";

  return (
    <svg width={size} height={size} viewBox="0 0 96 96" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="96" y2="96" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#E3FBFF" />
          <stop offset="1" stopColor="#7FD9EC" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="96" height="96" rx="22" fill={`url(#${gradientId})`} />
      <path d={blade} fill="#ffffff" />
      <path d={blade} fill="#ffffff" fillOpacity="0.8" transform="rotate(90 48 48)" />
      <path d={blade} fill="#ffffff" fillOpacity="0.6" transform="rotate(180 48 48)" />
      <path d={blade} fill="#ffffff" fillOpacity="0.42" transform="rotate(270 48 48)" />
      <circle cx="48" cy="48" r="6.5" fill="#0E7490" />
    </svg>
  );
}
