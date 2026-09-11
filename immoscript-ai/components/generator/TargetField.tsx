"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "immoscript-target-history";
const MAX_HISTORY = 8;

function loadHistory(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveToHistory(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return;
  try {
    const current = loadHistory().filter((v) => v.toLowerCase() !== trimmed.toLowerCase());
    localStorage.setItem(STORAGE_KEY, JSON.stringify([trimmed, ...current].slice(0, MAX_HISTORY)));
  } catch {
    // localStorage indisponible (navigation privée...) : le raccourci ne sera simplement pas mémorisé
  }
}

export function TargetField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  function remember(v: string) {
    saveToHistory(v);
    setHistory(loadHistory());
  }

  function pick(item: string) {
    onChange(item);
    remember(item);
  }

  return (
    <div>
      <label htmlFor="target" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
        Cible
      </label>
      <input
        id="target"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => remember(value)}
        placeholder="ex: jeunes actifs"
        className="w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 text-sm"
      />

      {history.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {history.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => pick(item)}
              className={`rounded-full border px-3 py-1 text-xs transition-all ${
                value === item
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
