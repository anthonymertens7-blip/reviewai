import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";

export interface ChecklistStep {
  label: string;
  done: boolean;
  href: string;
}

export function OnboardingChecklist({ steps }: { steps: ChecklistStep[] }) {
  const doneCount = steps.filter((s) => s.done).length;
  if (doneCount === steps.length) return null;

  return (
    <div className="rounded-3xl border dark:border-gray-700 bg-white dark:bg-gray-800 shadow-[0_10px_28px_-10px_rgba(15,23,42,0.16)] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.6)] p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">Bien démarrer avec ImmoScript AI</h2>
        <span className="text-xs text-gray-400">
          {doneCount} / {steps.length}
        </span>
      </div>
      <ul className="space-y-1">
        {steps.map((step) => (
          <li key={step.label}>
            <Link
              href={step.href}
              className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {step.done ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-500" />
              ) : (
                <Circle className="h-4 w-4 shrink-0 text-gray-300 dark:text-gray-600" />
              )}
              <span className={step.done ? "text-gray-400 line-through dark:text-gray-500" : "text-gray-700 dark:text-gray-200"}>
                {step.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
