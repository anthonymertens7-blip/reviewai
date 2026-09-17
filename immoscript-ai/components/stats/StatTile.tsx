import type { LucideIcon } from "lucide-react";
import { CARD_ACCENT_STYLES, type CardAccent } from "@/components/ui/cardAccents";
import { AnimatedNumber } from "./AnimatedNumber";

export function StatTile({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: LucideIcon;
  label: string;
  value: number | React.ReactNode;
  accent: CardAccent;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-3xl border p-4 shadow-[0_10px_28px_-10px_rgba(15,23,42,0.16)] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-10px_rgba(15,23,42,0.22)] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.6)] ${CARD_ACCENT_STYLES[accent].card}`}
    >
      <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${CARD_ACCENT_STYLES[accent].badge}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-semibold">{typeof value === "number" ? <AnimatedNumber value={value} /> : value}</p>
      </div>
    </div>
  );
}
