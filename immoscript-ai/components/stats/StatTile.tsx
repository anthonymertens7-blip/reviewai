import type { LucideIcon } from "lucide-react";
import { CARD_ACCENT_STYLES, type CardAccent } from "@/components/ui/cardAccents";

export function StatTile({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  accent: CardAccent;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-3xl border p-4 shadow-[0_10px_28px_-10px_rgba(15,23,42,0.16)] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.6)] ${CARD_ACCENT_STYLES[accent].card}`}
    >
      <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${CARD_ACCENT_STYLES[accent].badge}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-semibold">{value}</p>
      </div>
    </div>
  );
}
