import Link from "next/link";
import { CONTENT_TYPE_ICONS, CONTENT_TYPE_LABELS } from "@/lib/ai/labels";
import type { ContentType } from "@/lib/ai/types";
import { formatRelativeTime } from "@/lib/formatRelativeTime";

export interface ActivityItem {
  id: string;
  type: string;
  approvalStatus: string;
  createdAt: Date;
  programId: string;
  programName: string;
  authorName: string;
}

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) return null;

  return (
    <div>
      <h2 className="mb-3 text-lg font-medium">Activité récente</h2>
      <ul className="divide-y dark:divide-gray-700 rounded-3xl border dark:border-gray-700 bg-white dark:bg-gray-800 shadow-[0_10px_28px_-10px_rgba(15,23,42,0.16)] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.6)]">
        {items.map((item) => {
          const Icon = CONTENT_TYPE_ICONS[item.type as ContentType];
          const typeLabel = CONTENT_TYPE_LABELS[item.type as ContentType] ?? item.type;
          return (
            <li key={item.id} className="flex items-center gap-3 px-4 py-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                {Icon && <Icon className="h-4 w-4" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-gray-800 dark:text-gray-200">
                  <span className="font-medium">{item.authorName}</span> a généré{" "}
                  <span className="lowercase">{typeLabel}</span> pour{" "}
                  <Link href={`/library/${item.programId}`} className="text-brand-600 hover:underline">
                    {item.programName}
                  </Link>
                </p>
                <p className="text-xs text-gray-400">{formatRelativeTime(item.createdAt)}</p>
              </div>
              {item.approvalStatus === "approved" && (
                <span className="shrink-0 rounded-full bg-teal-100 px-2 py-0.5 text-[11px] font-medium text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
                  Approuvé
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
