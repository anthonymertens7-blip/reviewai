import { Building2, FileText, Home, Zap } from "lucide-react";
import { getAuthContext } from "@/lib/auth";
import { StatsService } from "@/lib/services/StatsService";
import { StatTile } from "@/components/stats/StatTile";
import { StatsSectionCard } from "@/components/stats/StatsSectionCard";
import { MonthlyBarChart } from "@/components/stats/MonthlyBarChart";
import { ContentTypeBreakdown } from "@/components/stats/ContentTypeBreakdown";
import { ApprovalStatusChart } from "@/components/stats/ApprovalStatusChart";
import { TopProgramsList } from "@/components/stats/TopProgramsList";
import { SocialStatsSection } from "@/components/stats/SocialStatsSection";

export default async function StatisticsPage() {
  const authContext = await getAuthContext();
  const stats = await StatsService.getOverview(authContext);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Statistiques</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Vue d&apos;ensemble de l&apos;activité de votre organisation.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile icon={Building2} label="Programmes" value={stats.programCount} accent="brand" />
        <StatTile icon={Home} label="Lots" value={stats.lotCount} accent="violet" />
        <StatTile icon={FileText} label="Contenus générés" value={stats.contentCount} accent="teal" />
        <StatTile
          icon={Zap}
          label="Générations IA ce mois-ci"
          value={
            stats.usage.quota === null ? (
              "Illimité"
            ) : (
              <>
                {stats.usage.used}
                <span className="text-base font-normal text-gray-400"> / {stats.usage.quota}</span>
              </>
            )
          }
          accent="amber"
        />
      </div>

      <StatsSectionCard title="Générations sur les 6 derniers mois">
        <MonthlyBarChart data={stats.monthlyGenerations} />
      </StatsSectionCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <StatsSectionCard title="Répartition par type de contenu">
          <ContentTypeBreakdown data={stats.contentByType} />
        </StatsSectionCard>

        <StatsSectionCard title="Statut de validation">
          <ApprovalStatusChart data={stats.approval} />
        </StatsSectionCard>
      </div>

      <StatsSectionCard title="Programmes les plus actifs" subtitle="Classés par nombre de contenus générés">
        <TopProgramsList data={stats.topPrograms} />
      </StatsSectionCard>

      <StatsSectionCard
        title="Performance réseaux sociaux"
        subtitle="Saisie manuelle pour l'instant — colle le lien de tes publications depuis une carte de contenu Instagram/TikTok."
      >
        <SocialStatsSection data={stats.social} />
      </StatsSectionCard>
    </div>
  );
}
