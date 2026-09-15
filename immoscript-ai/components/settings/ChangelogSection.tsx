import { Sparkles } from "lucide-react";
import { CHANGELOG_ENTRIES } from "@/lib/changelog";

export function ChangelogSection() {
  return (
    <div className="rounded-3xl border bg-white p-6 dark:border-gray-700 dark:bg-gray-800 shadow-[0_10px_28px_-10px_rgba(15,23,42,0.16)] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.6)]">
      <div className="mb-5 flex items-center gap-2.5">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-gray-700">
          <Sparkles className="h-4 w-4" />
        </span>
        <h2 className="font-semibold">Nouveautés</h2>
      </div>
      <ul className="space-y-4">
        {CHANGELOG_ENTRIES.map((entry) => (
          <li key={entry.title} className="border-l-2 border-brand-200 pl-4 dark:border-brand-900/60">
            <p className="font-medium text-gray-900 dark:text-gray-100">{entry.title}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{entry.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
