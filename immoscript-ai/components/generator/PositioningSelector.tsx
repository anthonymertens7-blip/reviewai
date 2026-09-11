"use client";

const OPTIONS = ["premium", "familial", "investissement", "primo-accédant", "seniors"];

export function PositioningSelector({
  value,
  onChange,
}: {
  value: string[];
  onChange: (value: string[]) => void;
}) {
  function toggle(option: string) {
    onChange(value.includes(option) ? value.filter((v) => v !== option) : [...value, option]);
  }

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Positionnement</p>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => toggle(option)}
            className={`rounded-full border dark:border-gray-700 px-3 py-1 text-sm ${
              value.includes(option) ? "border-brand-600 bg-brand-600 text-white" : "border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
