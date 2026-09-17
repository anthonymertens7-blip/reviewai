import Link from "next/link";
import { Zap } from "lucide-react";

export function QuotaIndicator({ used, quota }: { used: number; quota: number | null }) {
  const percent = quota === null || quota === 0 ? 0 : Math.min(100, Math.round((used / quota) * 100));
  const ringColor = percent >= 90 ? "#dc2626" : percent >= 70 ? "#d97706" : "#0284c7";
  const label = quota === null ? "Générations IA : illimité" : `Générations IA : ${used} / ${quota} ce mois-ci`;

  return (
    <Link
      href="/dashboard"
      aria-label={label}
      className="group relative flex h-11 w-11 items-center justify-center rounded-full transition-transform active:scale-90"
      style={quota === null ? undefined : { background: `conic-gradient(${ringColor} ${percent}%, var(--quota-track) ${percent}%)` }}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-100 text-amber-500 dark:bg-rose-950/40">
        <Zap className="h-4 w-4" />
      </span>
      <span className="pointer-events-none absolute left-full ml-3 -translate-x-1 whitespace-nowrap rounded-xl bg-gray-900 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100">
        {label}
      </span>
    </Link>
  );
}
