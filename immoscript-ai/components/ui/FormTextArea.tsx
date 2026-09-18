"use client";

import { useId } from "react";
import { useAutoGrowTextarea } from "@/lib/useAutoGrowTextarea";

export function FormTextArea({
  label,
  required,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
}) {
  const ref = useAutoGrowTextarea(value);
  const id = useId();

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      <textarea
        id={id}
        ref={ref}
        required={required}
        value={value}
        onChange={onChange}
        rows={rows}
        className="w-full resize-none overflow-hidden rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 text-sm"
      />
    </div>
  );
}
