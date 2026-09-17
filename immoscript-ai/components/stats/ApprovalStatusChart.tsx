import { FileEdit, Send, ShieldCheck } from "lucide-react";
import type { ApprovalBreakdown } from "@/lib/services/StatsService";
import { APPROVAL_COLOR_CLASSES } from "./chartPalette";
import { AnimatedNumber } from "./AnimatedNumber";
import { DonutChart } from "./DonutChart";

const ROWS: { key: keyof ApprovalBreakdown; label: string; icon: typeof FileEdit }[] = [
  { key: "draft", label: "Brouillon", icon: FileEdit },
  { key: "pending_review", label: "À valider", icon: Send },
  { key: "approved", label: "Approuvé", icon: ShieldCheck },
];

// Les couleurs de statut ne portent jamais seules l'information : légende maison avec icône +
// libellé (règle skill dataviz), plutôt que la légende générique à pastille du DonutChart.
export function ApprovalStatusChart({ data }: { data: ApprovalBreakdown }) {
  const total = data.draft + data.pending_review + data.approved;

  if (total === 0) {
    return <p className="py-6 text-center text-sm text-gray-400 dark:text-gray-500">Aucun contenu généré pour le moment.</p>;
  }

  return (
    <div className="space-y-4">
      <DonutChart
        hideLegend
        centerLabel="contenus"
        centerValue={total}
        data={ROWS.map(({ key, label }) => ({
          key,
          label,
          count: data[key],
          colorBg: APPROVAL_COLOR_CLASSES[key].bg,
          colorText: APPROVAL_COLOR_CLASSES[key].text,
        }))}
      />
      <ul className="grid grid-cols-3 gap-3">
        {ROWS.map(({ key, label, icon: Icon }) => (
          <li key={key} className="flex items-center gap-2">
            <Icon className={`h-4 w-4 shrink-0 ${APPROVAL_COLOR_CLASSES[key].text}`} />
            <div>
              <p className="text-sm font-medium leading-tight">
                <AnimatedNumber value={data[key]} />
              </p>
              <p className="text-xs leading-tight text-gray-500 dark:text-gray-400">{label}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
