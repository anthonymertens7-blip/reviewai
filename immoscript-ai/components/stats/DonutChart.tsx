"use client";

import { useEffect, useState } from "react";

export interface DonutSegment {
  key: string;
  label: string;
  count: number;
  colorBg: string; // classes Tailwind bg-[..] dark:bg-[..] (légende)
  colorText: string; // classes Tailwind text-[..] dark:text-[..] (stroke="currentColor")
}

const SIZE = 200;
const R = 74;
const STROKE = 22; // <= 24px, spec mark skill dataviz
const CIRCUMFERENCE = 2 * Math.PI * R;
const GAP = 3; // écart entre segments (spacer "surface gap" du skill dataviz)

// Camembert en anneau : préconisé "part-to-whole en un coup d'œil, <= 6 segments" par le skill
// dataviz — au-delà, les valeurs se distinguent mal par l'angle seul. Chaque segment porte son
// propre libellé + pourcentage dans la légende, jamais l'identité par la couleur seule.
export function DonutChart({
  data,
  centerLabel,
  centerValue,
  hideLegend,
}: {
  data: DonutSegment[];
  centerLabel: string;
  centerValue: number;
  /** Le caller fournit son propre légende (ex: icône + libellé requis pour une couleur de statut). */
  hideLegend?: boolean;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const total = data.reduce((sum, d) => sum + d.count, 0);
  if (total === 0) {
    return <p className="py-6 text-center text-sm text-gray-400 dark:text-gray-500">Aucune donnée pour le moment.</p>;
  }

  let cumulative = 0;
  const segments = data.map((d) => {
    const frac = d.count / total;
    const len = frac * CIRCUMFERENCE;
    const offset = CIRCUMFERENCE - cumulative;
    cumulative += len;
    const dash = Math.max(0, len - GAP);
    return { ...d, dash, offset, pct: Math.round(frac * 100) };
  });

  const active = segments.find((s) => s.key === hovered);

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-center">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        width={SIZE}
        height={SIZE}
        className="shrink-0"
        role="img"
        aria-label={`Répartition ${centerLabel}`}
      >
        <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
          <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" strokeWidth={STROKE} className="stroke-gray-100 dark:stroke-gray-700" />
          {segments.map((s) => (
            <circle
              key={s.key}
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              fill="none"
              strokeWidth={STROKE}
              strokeLinecap="round"
              stroke="currentColor"
              className={`${s.colorText} transition-all ease-out`}
              strokeDasharray={`${grown ? s.dash : 0} ${CIRCUMFERENCE}`}
              strokeDashoffset={s.offset}
              style={{ transitionDuration: "700ms", transitionDelay: `${data.indexOf(s) * 90}ms` }}
              opacity={hovered === null || hovered === s.key ? 1 : 0.35}
              onMouseEnter={() => setHovered(s.key)}
              onMouseLeave={() => setHovered(null)}
              tabIndex={0}
              onFocus={() => setHovered(s.key)}
              onBlur={() => setHovered(null)}
            />
          ))}
        </g>
        <text x={SIZE / 2} y={SIZE / 2 - 6} textAnchor="middle" className="fill-gray-900 text-2xl font-semibold dark:fill-gray-100">
          {active ? active.count : centerValue}
        </text>
        <text x={SIZE / 2} y={SIZE / 2 + 16} textAnchor="middle" className="fill-gray-400 text-[11px] dark:fill-gray-500">
          {active ? `${active.label} · ${active.pct}%` : centerLabel}
        </text>
      </svg>

      {!hideLegend && (
        <ul className="w-full space-y-1.5 sm:w-auto">
          {segments.map((s) => (
            <li
              key={s.key}
              onMouseEnter={() => setHovered(s.key)}
              onMouseLeave={() => setHovered(null)}
              className={`flex items-center gap-2 rounded-md px-1.5 py-1 text-sm transition-opacity ${
                hovered !== null && hovered !== s.key ? "opacity-40" : ""
              }`}
            >
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${s.colorBg}`} />
              <span className="w-28 truncate text-gray-700 dark:text-gray-300">{s.label}</span>
              <span className="tabular-nums text-gray-500 dark:text-gray-400">
                {s.count} <span className="text-gray-400 dark:text-gray-500">({s.pct}%)</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
