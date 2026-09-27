"use client";

import { useId } from "react";

/**
 * Bâtiment stylisé (toit à deux pans, fenêtres, porte) sur fond dégradé — même dégradé que le
 * fond de l'app (--bg-from/--bg-to en mode clair, voir app/globals.css). Un seul mark réutilisé
 * partout (favicon, en-tête public, sidebar) plutôt qu'un simple monogramme.
 */
export function LogoMark({ size = 36, className }: { size?: number; className?: string }) {
  const gradientId = useId();

  return (
    <svg width={size} height={size} viewBox="0 0 96 96" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="96" y2="96" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#E3FBFF" />
          <stop offset="1" stopColor="#7FD9EC" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="96" height="96" rx="22" fill={`url(#${gradientId})`} />
      <path d="M26 34 L58 34 L58 80 L26 80 Z" fill="#ffffff" />
      <path d="M58 34 L66 28 L66 74 L58 80 Z" fill="#ffffff" fillOpacity="0.75" />
      <path d="M26 34 L42 20 L58 34 Z" fill="#ffffff" />
      <path d="M58 34 L66 28 L50 14 L42 20 Z" fill="#ffffff" fillOpacity="0.75" />
      <rect x="32" y="42" width="8" height="8" rx="1.5" fill="#0E7490" fillOpacity="0.55" />
      <rect x="46" y="42" width="8" height="8" rx="1.5" fill="#0E7490" fillOpacity="0.55" />
      <rect x="32" y="54" width="8" height="8" rx="1.5" fill="#0E7490" fillOpacity="0.55" />
      <rect x="46" y="54" width="8" height="8" rx="1.5" fill="#0E7490" fillOpacity="0.55" />
      <rect x="38" y="64" width="12" height="16" rx="2" fill="#0E7490" fillOpacity="0.55" />
    </svg>
  );
}
