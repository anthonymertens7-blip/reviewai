"use client";

import { CONTENT_TYPES, type ContentType } from "@/lib/ai/types";
import { CONTENT_TYPE_LABELS, CONTENT_TYPE_ICONS } from "@/lib/ai/labels";

export function ContentTypeChecklist({
  value,
  onChange,
}: {
  value: ContentType[];
  onChange: (value: ContentType[]) => void;
}) {
  function toggle(type: ContentType) {
    onChange(value.includes(type) ? value.filter((t) => t !== type) : [...value, type]);
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {CONTENT_TYPES.map((type) => {
        const Icon = CONTENT_TYPE_ICONS[type];
        const selected = value.includes(type);
        return (
          <button
            key={type}
            type="button"
            onClick={() => toggle(type)}
            className={`flex items-center gap-2.5 rounded-2xl border p-3 text-left text-sm font-medium transition-all ${
              selected
                ? "border-brand-600 bg-brand-50 text-brand-700 shadow-[0_6px_16px_-8px_rgba(2,132,199,0.4)]"
                : "border-gray-200 text-gray-600 shadow-transparent hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700"
            }`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                selected ? "bg-brand-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
              }`}
            >
              <Icon className="h-4 w-4" />
            </span>
            {CONTENT_TYPE_LABELS[type]}
          </button>
        );
      })}
    </div>
  );
}
