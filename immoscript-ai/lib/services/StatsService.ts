import type { AuthContext } from "@/lib/auth";
import { UsageService } from "./UsageService";
import { CONTENT_TYPE_LABELS } from "@/lib/ai/labels";
import type { ContentType } from "@/lib/ai/types";

const MONTHS_HISTORY = 6;
// Rendu en camembert : le skill dataviz plafonne le "part-to-whole en un coup d'œil" à 6 segments
// (au-delà, les valeurs se distinguent mal par l'angle seul) — les types les moins fréquents
// au-delà sont regroupés en "Autres".
const MAX_CONTENT_TYPE_SLOTS = 6;
const MAX_TOP_PROGRAMS = 5;
const MAX_TOP_POSTS = 5;

export interface MonthlyGenerationPoint {
  month: string; // "2026-04", pour la clé React
  label: string; // "avr."
  count: number;
}

export interface ContentTypeBreakdownItem {
  type: ContentType | "autres";
  label: string;
  count: number;
}

export interface ApprovalBreakdown {
  draft: number;
  pending_review: number;
  approved: number;
}

export interface TopProgramItem {
  id: string;
  name: string;
  count: number;
}

export interface TopSocialPost {
  id: string;
  type: string;
  programId: string;
  programName: string;
  url: string | null;
  likes: number;
  views: number;
  comments: number;
}

export interface SocialStatsSummary {
  totalLikes: number;
  totalViews: number;
  totalComments: number;
  linkedPostsCount: number;
  topPosts: TopSocialPost[];
}

export interface StatsOverview {
  programCount: number;
  lotCount: number;
  contentCount: number;
  usage: { used: number; quota: number | null };
  monthlyGenerations: MonthlyGenerationPoint[];
  contentByType: ContentTypeBreakdownItem[];
  approval: ApprovalBreakdown;
  topPrograms: TopProgramItem[];
  social: SocialStatsSummary;
}

const MONTH_LABELS = [
  "janv.", "févr.", "mars", "avr.", "mai", "juin",
  "juil.", "août", "sept.", "oct.", "nov.", "déc.",
];

function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export class StatsService {
  static async getOverview(authContext: AuthContext): Promise<StatsOverview> {
    const { db, organizationId } = authContext;

    const historyStart = new Date();
    historyStart.setUTCMonth(historyStart.getUTCMonth() - (MONTHS_HISTORY - 1), 1);
    historyStart.setUTCHours(0, 0, 0, 0);

    const [
      programCount,
      lotCount,
      contentCount,
      usage,
      recentContents,
      typeGroups,
      approvalGroups,
      programGroups,
      socialAggregate,
      topPostsRaw,
    ] = await Promise.all([
      db.program.count(),
      db.lot.count(),
      db.generatedContent.count({ where: { status: { not: "archived" } } }),
      UsageService.getUsage(organizationId),
      db.generatedContent.findMany({
        where: { status: { not: "archived" }, createdAt: { gte: historyStart } },
        select: { createdAt: true },
      }),
      db.generatedContent.groupBy({
        by: ["type"],
        _count: { _all: true },
        where: { status: { not: "archived" } },
      }),
      db.generatedContent.groupBy({
        by: ["approvalStatus"],
        _count: { _all: true },
        where: { status: { not: "archived" } },
      }),
      db.generatedContent.groupBy({
        by: ["programId"],
        _count: { _all: true },
        where: { status: { not: "archived" } },
        orderBy: { _count: { programId: "desc" } },
        take: MAX_TOP_PROGRAMS,
      }),
      db.generatedContent.aggregate({
        _sum: { externalLikes: true, externalViews: true, externalComments: true },
        _count: { _all: true },
        where: { externalPostUrl: { not: null } },
      }),
      db.generatedContent.findMany({
        where: { externalPostUrl: { not: null } },
        orderBy: { externalLikes: "desc" },
        take: MAX_TOP_POSTS,
        select: {
          id: true,
          type: true,
          externalPostUrl: true,
          externalLikes: true,
          externalViews: true,
          externalComments: true,
          program: { select: { id: true, name: true } },
        },
      }),
    ]);

    // Génération par mois : bucketing en JS plutôt qu'un date_trunc SQL, pour rester portable
    // et ne pas dépendre d'une requête raw sur le client Prisma tenant-scopé.
    const monthBuckets = new Map<string, number>();
    for (let i = 0; i < MONTHS_HISTORY; i++) {
      const d = new Date(historyStart);
      d.setUTCMonth(d.getUTCMonth() + i);
      monthBuckets.set(monthKey(d), 0);
    }
    for (const content of recentContents) {
      const key = monthKey(content.createdAt);
      if (monthBuckets.has(key)) {
        monthBuckets.set(key, (monthBuckets.get(key) ?? 0) + 1);
      }
    }
    const monthlyGenerations: MonthlyGenerationPoint[] = Array.from(monthBuckets.entries()).map(([key, count]) => {
      const monthIndex = Number(key.split("-")[1]) - 1;
      return { month: key, label: MONTH_LABELS[monthIndex] ?? key, count };
    });

    // Répartition par type : les types les moins fréquents au-delà de MAX_CONTENT_TYPE_SLOTS sont
    // regroupés en "Autres" plutôt que d'étaler la palette catégorielle au-delà de ce qu'elle
    // garantit de rester distinguable (voir skill dataviz).
    const sortedTypes = typeGroups
      .map((g) => ({ type: g.type as ContentType, count: g._count._all }))
      .sort((a, b) => b.count - a.count);
    const topTypes = sortedTypes.slice(0, MAX_CONTENT_TYPE_SLOTS);
    const otherCount = sortedTypes.slice(MAX_CONTENT_TYPE_SLOTS).reduce((sum, t) => sum + t.count, 0);
    const contentByType: ContentTypeBreakdownItem[] = [
      ...topTypes.map((t) => ({ type: t.type, label: CONTENT_TYPE_LABELS[t.type] ?? t.type, count: t.count })),
      ...(otherCount > 0 ? [{ type: "autres" as const, label: "Autres", count: otherCount }] : []),
    ];

    const approval: ApprovalBreakdown = { draft: 0, pending_review: 0, approved: 0 };
    for (const g of approvalGroups) {
      if (g.approvalStatus === "draft" || g.approvalStatus === "pending_review" || g.approvalStatus === "approved") {
        approval[g.approvalStatus] = g._count._all;
      }
    }

    const programIds = programGroups.map((g) => g.programId);
    const programs = programIds.length > 0 ? await db.program.findMany({ where: { id: { in: programIds } }, select: { id: true, name: true } }) : [];
    const programNameById = new Map(programs.map((p) => [p.id, p.name]));
    const topPrograms: TopProgramItem[] = programGroups
      .map((g) => ({ id: g.programId, name: programNameById.get(g.programId) ?? "Programme supprimé", count: g._count._all }))
      .filter((p) => p.count > 0);

    const social: SocialStatsSummary = {
      totalLikes: socialAggregate._sum.externalLikes ?? 0,
      totalViews: socialAggregate._sum.externalViews ?? 0,
      totalComments: socialAggregate._sum.externalComments ?? 0,
      linkedPostsCount: socialAggregate._count._all,
      topPosts: topPostsRaw.map((p) => ({
        id: p.id,
        type: p.type,
        programId: p.program.id,
        programName: p.program.name,
        url: p.externalPostUrl,
        likes: p.externalLikes ?? 0,
        views: p.externalViews ?? 0,
        comments: p.externalComments ?? 0,
      })),
    };

    return {
      programCount,
      lotCount,
      contentCount,
      usage,
      monthlyGenerations,
      contentByType,
      approval,
      topPrograms,
      social,
    };
  }
}
