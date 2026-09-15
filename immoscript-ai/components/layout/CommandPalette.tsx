"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import { Building2, Home, Library, Search, Settings, X } from "lucide-react";

interface ProgramResult {
  id: string;
  name: string;
  city: string;
}

interface ResultItem {
  key: string;
  label: string;
  sublabel?: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
}

const STATIC_DESTINATIONS: Omit<ResultItem, "key">[] = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Programmes", href: "/programs", icon: Building2 },
  { label: "Bibliothèque", href: "/library", icon: Library },
  { label: "Paramètres", href: "/settings", icon: Settings },
];

export function CommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [programs, setPrograms] = useState<ProgramResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((v) => !v);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    function handleOpenEvent() {
      setIsOpen(true);
    }
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-command-palette", handleOpenEvent);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-command-palette", handleOpenEvent);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setActiveIndex(0);
      inputRef.current?.focus();
      fetch("/api/programs")
        .then((res) => res.json())
        .then((body) => setPrograms(body.programs ?? []))
        .catch(() => setPrograms([]));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const normalized = query.trim().toLowerCase();

  const results: ResultItem[] = [
    ...STATIC_DESTINATIONS.filter((d) => d.label.toLowerCase().includes(normalized)).map((d) => ({ ...d, key: `dest-${d.href}` })),
    ...programs
      .filter((p) => p.name.toLowerCase().includes(normalized) || p.city.toLowerCase().includes(normalized))
      .slice(0, 6)
      .map((p) => ({ key: `program-${p.id}`, label: p.name, sublabel: p.city, href: `/programs/${p.id}`, icon: Building2 })),
  ];

  function go(href: string) {
    setIsOpen(false);
    router.push(href);
  }

  function handleInputKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const result = results[activeIndex];
      if (result) go(result.href);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-[15vh]" onClick={() => setIsOpen(false)}>
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3 dark:border-gray-700">
          <Search className="h-4 w-4 shrink-0 text-gray-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="Rechercher un programme, une page..."
            className="w-full border-0 bg-transparent p-0 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 dark:text-gray-100"
          />
          <button onClick={() => setIsOpen(false)} className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-gray-400">Aucun résultat.</p>
          ) : (
            results.map((result, index) => {
              const Icon = result.icon;
              return (
                <button
                  key={result.key}
                  onClick={() => go(result.href)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm ${
                    index === activeIndex
                      ? "bg-brand-50 text-brand-700 dark:bg-gray-700 dark:text-brand-300"
                      : "text-gray-700 dark:text-gray-200"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 truncate">{result.label}</span>
                  {result.sublabel && <span className="text-xs text-gray-400">{result.sublabel}</span>}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
