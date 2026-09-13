"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { CompletenessBadge } from "@/components/ui/CompletenessBadge";

export interface ProgramSummary {
  id: string;
  name: string;
  city: string;
  programType: string | null;
  completenessScore: number;
}

export function ProgramsList({ programs }: { programs: ProgramSummary[] }) {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLowerCase();
  const filtered = normalized
    ? programs.filter((p) => p.name.toLowerCase().includes(normalized) || p.city.toLowerCase().includes(normalized))
    : programs;

  return (
    <div className="space-y-3">
      {programs.length > 5 && (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par nom ou ville..."
            className="w-full rounded-xl border-gray-300 pl-9 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="rounded-3xl border dark:border-gray-700 border-dashed p-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Aucun programme ne correspond à cette recherche.
        </p>
      ) : (
        <ul className="divide-y dark:divide-gray-700 rounded-3xl border dark:border-gray-700 bg-white dark:bg-gray-800 shadow-[0_10px_28px_-10px_rgba(15,23,42,0.16)] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.6)]">
          {filtered.map((program) => (
            <li key={program.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <Link href={`/programs/${program.id}`} className="font-medium hover:underline">
                  {program.name}
                </Link>
                <p className="text-sm text-gray-500 dark:text-gray-400">{program.city}</p>
              </div>
              <div className="flex items-center gap-2">
                {program.programType && (
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                    {program.programType}
                  </span>
                )}
                <CompletenessBadge score={program.completenessScore} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
