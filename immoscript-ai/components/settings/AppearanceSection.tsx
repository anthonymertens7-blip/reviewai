"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/useTheme";

export function AppearanceSection() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="rounded-3xl border bg-white p-6 dark:border-gray-700 dark:bg-gray-800 shadow-[0_10px_28px_-10px_rgba(15,23,42,0.16)] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.6)]">
      <h2 className="font-semibold">Apparence</h2>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Choisissez l&apos;apparence de l&apos;interface.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setTheme("light")}
          className={`flex items-center gap-2.5 rounded-2xl border p-4 text-left text-sm font-medium transition-colors ${
            theme === "light"
              ? "border-brand-600 bg-brand-50 text-brand-700"
              : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700"
          }`}
        >
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
              theme === "light" ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
            }`}
          >
            <Sun className="h-4 w-4" />
          </span>
          Clair
        </button>

        <button
          type="button"
          onClick={() => setTheme("dark")}
          className={`flex items-center gap-2.5 rounded-2xl border p-4 text-left text-sm font-medium transition-colors ${
            theme === "dark"
              ? "border-brand-600 bg-brand-50 text-brand-700 dark:bg-gray-900"
              : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700"
          }`}
        >
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
              theme === "dark" ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
            }`}
          >
            <Moon className="h-4 w-4" />
          </span>
          Sombre
        </button>
      </div>
    </div>
  );
}
