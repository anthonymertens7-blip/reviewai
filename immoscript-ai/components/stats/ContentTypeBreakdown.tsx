"use client";

import { useEffect, useState } from "react";
import type { ContentTypeBreakdownItem } from "@/lib/services/StatsService";
import { contentTypeColorClasses } from "./chartPalette";

// Chaque ligne porte son propre libellé texte à côté de la couleur : contrairement à un
// camembert, l'identité n'est jamais portée par la couleur seule ici (pas besoin d'une légende
// séparée en plus).
export function ContentTypeBreakdown({ data }: { data: ContentTypeBreakdownItem[] }) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  // Barres qui poussent à l'apparition — neutralisé par [data-reduce-motion="true"] (globals.css).
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  if (total === 0) {
    return <p className="py-6 text-center text-sm text-gray-400 dark:text-gray-500">Aucun contenu généré pour le moment.</p>;
  }

  const max = Math.max(...data.map((d) => d.count));

  return (
    <ul className="space-y-2.5">
      {data.map((item, i) => {
        const colors = contentTypeColorClasses(item.type);
        const pct = Math.round((item.count / total) * 100);
        return (
          <li key={item.type} className="flex items-center gap-3">
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${colors.bg}`} />
            <span className="w-28 shrink-0 truncate text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
            <span className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
              <span
                className={`block h-full rounded-full transition-all ease-out ${colors.bg}`}
                style={{
                  width: grown ? `${Math.max(4, (item.count / max) * 100)}%` : "0%",
                  transitionDuration: "650ms",
                  transitionDelay: `${i * 60}ms`,
                }}
              />
            </span>
            <span className="w-16 shrink-0 text-right text-sm tabular-nums text-gray-500 dark:text-gray-400">
              {item.count} <span className="text-gray-400 dark:text-gray-500">({pct}%)</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
