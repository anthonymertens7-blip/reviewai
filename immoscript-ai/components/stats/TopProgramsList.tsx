"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { TopProgramItem } from "@/lib/services/StatsService";

// Une seule teinte (magnitude, pas d'identité à distinguer entre programmes) : cohérent avec la
// règle "sequential = une seule teinte" du skill dataviz.
export function TopProgramsList({ data }: { data: TopProgramItem[] }) {
  // Barres qui poussent à l'apparition — neutralisé par [data-reduce-motion="true"] (globals.css).
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  if (data.length === 0) {
    return <p className="py-6 text-center text-sm text-gray-400 dark:text-gray-500">Aucun programme actif pour le moment.</p>;
  }

  const max = Math.max(...data.map((d) => d.count));

  return (
    <ul className="space-y-2.5">
      {data.map((program, i) => (
        <li key={program.id} className="flex items-center gap-3">
          <Link
            href={`/programs/${program.id}`}
            className="w-32 shrink-0 truncate text-sm text-gray-700 hover:text-brand-600 hover:underline dark:text-gray-300 dark:hover:text-brand-300"
            title={program.name}
          >
            {program.name}
          </Link>
          <span className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
            <span
              className="block h-full rounded-full bg-[#2a78d6] transition-all ease-out dark:bg-[#3987e5]"
              style={{
                width: grown ? `${Math.max(4, (program.count / max) * 100)}%` : "0%",
                transitionDuration: "650ms",
                transitionDelay: `${i * 60}ms`,
              }}
            />
          </span>
          <span className="w-20 shrink-0 text-right text-sm tabular-nums text-gray-500 dark:text-gray-400">
            {program.count} contenu{program.count > 1 ? "s" : ""}
          </span>
        </li>
      ))}
    </ul>
  );
}
