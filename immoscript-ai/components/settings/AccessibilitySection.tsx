"use client";

import { Contrast, Type, Zap } from "lucide-react";
import { useAccessibilityPrefs, type FontSize } from "@/lib/useAccessibilityPrefs";

const FONT_SIZE_OPTIONS: { id: FontSize; label: string }[] = [
  { id: "normal", label: "Normale" },
  { id: "large", label: "Grande" },
  { id: "xlarge", label: "Très grande" },
];

function ToggleRow({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-gray-700 dark:text-brand-400">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>
      <label className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center">
        <input
          type="checkbox"
          role="switch"
          className="peer sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-label={title}
        />
        <span className="absolute inset-0 rounded-full bg-gray-300 transition-colors peer-checked:bg-brand-600 dark:bg-gray-600" />
        <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </label>
    </div>
  );
}

export function AccessibilitySection() {
  const { prefs, update } = useAccessibilityPrefs();

  return (
    <div className="rounded-3xl border bg-white p-6 dark:border-gray-700 dark:bg-gray-800 shadow-[0_10px_28px_-10px_rgba(15,23,42,0.16)] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.6)]">
      <h2 className="font-semibold">Accessibilité</h2>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Réglages pour faciliter la lecture, en cas de gêne visuelle ou de sensibilité aux animations.
      </p>

      <div className="mt-4 divide-y divide-gray-100 dark:divide-gray-700">
        <ToggleRow
          icon={Contrast}
          title="Contraste élevé"
          description="Renforce le contraste des textes secondaires et des bordures."
          checked={prefs.highContrast}
          onChange={(checked) => update({ highContrast: checked })}
        />
        <ToggleRow
          icon={Zap}
          title="Réduire les animations"
          description="Supprime les transitions et effets de mouvement de l'interface."
          checked={prefs.reduceMotion}
          onChange={(checked) => update({ reduceMotion: checked })}
        />
      </div>

      <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-gray-700 dark:text-brand-400">
            <Type className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Taille du texte</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Agrandit le texte dans toute l&apos;application.</p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {FONT_SIZE_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => update({ fontSize: option.id })}
              className={`rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                prefs.fontSize === option.id
                  ? "border-brand-600 bg-brand-50 text-brand-700 dark:bg-gray-900"
                  : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
