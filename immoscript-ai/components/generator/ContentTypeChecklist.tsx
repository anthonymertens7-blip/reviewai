"use client";

import { CONTENT_TYPES, type ContentType } from "@/lib/ai/types";
import { CONTENT_TYPE_LABELS } from "@/lib/ai/labels";

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
    <div>
      <p className="mb-2 text-sm font-medium text-gray-700">Contenus à générer</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {CONTENT_TYPES.map((type) => (
          <label key={type} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={value.includes(type)}
              onChange={() => toggle(type)}
              className="rounded border-gray-300"
            />
            {CONTENT_TYPE_LABELS[type]}
          </label>
        ))}
      </div>
    </div>
  );
}
