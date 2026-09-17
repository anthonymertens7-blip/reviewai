"use client";

import { useEffect, useState } from "react";
import type { MonthlyGenerationPoint } from "@/lib/services/StatsService";

const WIDTH = 560;
const HEIGHT = 180;
const MARGIN = { top: 16, right: 8, bottom: 24, left: 8 };

export function MonthlyBarChart({ data }: { data: MonthlyGenerationPoint[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  // Barres qui poussent depuis la ligne de base à l'apparition, plutôt qu'un graphique statique —
  // [data-reduce-motion="true"] (voir globals.css) neutralise ces transitions CSS automatiquement.
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const innerWidth = WIDTH - MARGIN.left - MARGIN.right;
  const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom;
  const max = Math.max(1, ...data.map((d) => d.count));
  const barWidth = data.length > 0 ? innerWidth / data.length : innerWidth;
  const barGap = Math.min(16, barWidth * 0.35);

  if (data.every((d) => d.count === 0)) {
    return (
      <p className="flex h-[180px] items-center justify-center text-sm text-gray-400 dark:text-gray-500">
        Pas encore de génération sur cette période.
      </p>
    );
  }

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label="Générations de contenu par mois">
        <line
          x1={MARGIN.left}
          x2={WIDTH - MARGIN.right}
          y1={HEIGHT - MARGIN.bottom}
          y2={HEIGHT - MARGIN.bottom}
          className="stroke-gray-200 dark:stroke-gray-700"
          strokeWidth={1}
        />
        {data.map((d, i) => {
          const barHeight = (d.count / max) * innerHeight;
          const x = MARGIN.left + i * barWidth + barGap / 2;
          const y = HEIGHT - MARGIN.bottom - barHeight;
          const w = Math.max(0, barWidth - barGap);
          const isHovered = hovered === i;
          return (
            <g
              key={d.month}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-default"
            >
              {/* Zone de survol plus large que la barre pour un hit target confortable */}
              <rect x={MARGIN.left + i * barWidth} y={MARGIN.top} width={barWidth} height={innerHeight} fill="transparent" />
              <rect
                x={x}
                y={grown ? (d.count > 0 ? y : HEIGHT - MARGIN.bottom - 2) : HEIGHT - MARGIN.bottom}
                width={w}
                height={grown ? (d.count > 0 ? barHeight : 2) : 0}
                rx={4}
                fill="currentColor"
                className="text-[#2a78d6] transition-all ease-out dark:text-[#3987e5]"
                style={{ transitionDuration: "650ms", transitionDelay: `${i * 45}ms` }}
                opacity={isHovered || hovered === null ? 1 : 0.45}
              />
              <text
                x={x + w / 2}
                y={HEIGHT - MARGIN.bottom + 14}
                textAnchor="middle"
                className="fill-gray-400 text-[9px] dark:fill-gray-500"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
      {hovered !== null && data[hovered] && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-lg border bg-white px-2.5 py-1.5 text-xs shadow-lg dark:border-gray-700 dark:bg-gray-900"
          style={{
            left: `${((MARGIN.left + hovered * barWidth + barWidth / 2) / WIDTH) * 100}%`,
            top: `${((HEIGHT - MARGIN.bottom - (data[hovered].count / max) * innerHeight - 8) / HEIGHT) * 100}%`,
          }}
        >
          <p className="font-medium text-gray-900 dark:text-gray-100">
            {data[hovered].count} génération{data[hovered].count > 1 ? "s" : ""}
          </p>
          <p className="text-gray-400 dark:text-gray-500">{data[hovered].label}</p>
        </div>
      )}
    </div>
  );
}
