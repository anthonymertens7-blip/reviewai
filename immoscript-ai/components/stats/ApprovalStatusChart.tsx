import { FileEdit, Send, ShieldCheck } from "lucide-react";
import type { ApprovalBreakdown } from "@/lib/services/StatsService";
import { APPROVAL_COLOR_CLASSES } from "./chartPalette";

const ROWS: { key: keyof ApprovalBreakdown; label: string; icon: typeof FileEdit }[] = [
  { key: "draft", label: "Brouillon", icon: FileEdit },
  { key: "pending_review", label: "À valider", icon: Send },
  { key: "approved", label: "Approuvé", icon: ShieldCheck },
];

// Les couleurs de statut ne portent jamais seules l'information : chaque segment et chaque ligne
// est systématiquement accompagné d'une icône et d'un libellé texte (règle skill dataviz).
export function ApprovalStatusChart({ data }: { data: ApprovalBreakdown }) {
  const total = data.draft + data.pending_review + data.approved;

  if (total === 0) {
    return <p className="py-6 text-center text-sm text-gray-400 dark:text-gray-500">Aucun contenu généré pour le moment.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
        {ROWS.map(({ key }) => {
          const pct = (data[key] / total) * 100;
          if (pct === 0) return null;
          return (
            <div
              key={key}
              className={`h-full ${APPROVAL_COLOR_CLASSES[key].bg} first:rounded-l-full last:rounded-r-full`}
              style={{ width: `${pct}%` }}
            />
          );
        })}
      </div>
      <ul className="grid grid-cols-3 gap-3">
        {ROWS.map(({ key, label, icon: Icon }) => (
          <li key={key} className="flex items-center gap-2">
            <Icon className={`h-4 w-4 shrink-0 ${APPROVAL_COLOR_CLASSES[key].text}`} />
            <div>
              <p className="text-sm font-medium leading-tight">{data[key]}</p>
              <p className="text-xs leading-tight text-gray-500 dark:text-gray-400">{label}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
