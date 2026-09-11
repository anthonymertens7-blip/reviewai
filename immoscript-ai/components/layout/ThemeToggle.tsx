"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/useTheme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Activer le mode clair" : "Activer le mode sombre"}
      className="group relative flex h-11 w-11 items-center justify-center rounded-2xl text-gray-500 shadow-transparent transition-all hover:bg-brand-50 hover:text-brand-600 hover:shadow-sm dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-brand-400"
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      <span className="pointer-events-none absolute left-full ml-3 -translate-x-1 whitespace-nowrap rounded-xl bg-gray-900 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100">
        {isDark ? "Mode clair" : "Mode sombre"}
      </span>
    </button>
  );
}
