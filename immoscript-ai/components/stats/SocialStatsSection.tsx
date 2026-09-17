import Link from "next/link";
import { Heart, MessageCircle, Eye, ExternalLink } from "lucide-react";
import type { SocialStatsSummary } from "@/lib/services/StatsService";
import { CONTENT_TYPE_LABELS } from "@/lib/ai/labels";
import type { ContentType } from "@/lib/ai/types";
import { CARD_ACCENT_STYLES } from "@/components/ui/cardAccents";
import { AnimatedNumber } from "./AnimatedNumber";

const TILES = [
  { key: "totalLikes" as const, label: "Mentions J'aime", icon: Heart, accent: "rose" as const },
  { key: "totalViews" as const, label: "Vues", icon: Eye, accent: "indigo" as const },
  { key: "totalComments" as const, label: "Commentaires", icon: MessageCircle, accent: "amber" as const },
];

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
}

export function SocialStatsSection({ data }: { data: SocialStatsSummary }) {
  if (data.linkedPostsCount === 0) {
    return (
      <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
        Aucune publication liée pour le moment. Depuis un contenu Instagram/TikTok généré, colle le lien de ta
        publication une fois postée pour suivre ses performances ici.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        {TILES.map(({ key, label, icon: Icon, accent }) => (
          <div key={key} className={`flex items-center gap-2.5 rounded-2xl border p-3 ${CARD_ACCENT_STYLES[accent].card}`}>
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${CARD_ACCENT_STYLES[accent].badge}`}>
              <Icon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-lg font-semibold leading-tight">
                <AnimatedNumber value={data[key]} format={formatCount} />
              </p>
              <p className="text-xs leading-tight text-gray-500 dark:text-gray-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
          Publications les plus performantes
        </p>
        <ul className="divide-y rounded-2xl border dark:divide-gray-700 dark:border-gray-700">
          {data.topPosts.map((post) => (
            <li key={post.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {CONTENT_TYPE_LABELS[post.type as ContentType] ?? post.type} · {post.programName}
                </p>
                <p className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3" /> {post.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" /> {post.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" /> {post.comments}
                  </span>
                </p>
              </div>
              {post.url && (
                <Link
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex shrink-0 items-center gap-1 text-xs text-brand-600 hover:underline dark:text-brand-300"
                >
                  Voir <ExternalLink className="h-3 w-3" />
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
