import Link from "next/link";
import { Building2, FileText, Zap } from "lucide-react";
import { Role } from "@prisma/client";
import { getAuthContext } from "@/lib/auth";
import { CARD_ACCENT_STYLES } from "@/components/ui/cardAccents";
import { UsageService } from "@/lib/services/UsageService";
import { OnboardingChecklist, type ChecklistStep } from "@/components/dashboard/OnboardingChecklist";
import { ActivityFeed, type ActivityItem } from "@/components/dashboard/ActivityFeed";
import { planLabel } from "@/lib/billing/plans";

export default async function DashboardPage() {
  const { db, organizationId, userId, role } = await getAuthContext();

  // Un Collaborateur ne voit, partout ailleurs dans l'app (ProgramService.list, StatsService),
  // que les programmes auxquels il a un accès explicite. Sans ce filtre ici, le dashboard —
  // première page vue après connexion, avant toute navigation — contournait cette restriction :
  // "Programmes récents" et "Activité récente" affichaient le nom de programmes non accessibles,
  // et ce dernier expose même le nom/email de qui a généré le contenu.
  const programScope = role === Role.COLLABORATEUR ? { access: { some: { userId } } } : {};

  const [organization, programCount, lotCount, contentCount, memberCount, recentPrograms, recentActivity, usage] = await Promise.all([
    db.organization.findUnique({ where: { id: organizationId }, select: { name: true, plan: true } }),
    db.program.count({ where: programScope }),
    db.lot.count({ where: { program: programScope } }),
    db.generatedContent.count({ where: { status: { not: "archived" }, program: programScope } }),
    db.user.count(),
    db.program.findMany({
      where: programScope,
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, name: true, city: true, updatedAt: true },
    }),
    db.generatedContent.findMany({
      where: { status: { not: "archived" }, program: programScope },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        type: true,
        approvalStatus: true,
        createdAt: true,
        program: { select: { id: true, name: true } },
        createdBy: { select: { name: true, email: true } },
      },
    }),
    UsageService.getUsage(organizationId),
  ]);

  const firstProgramId = recentPrograms[0]?.id;

  const checklistSteps: ChecklistStep[] = [
    { label: "Créer votre premier programme", done: programCount > 0, href: "/programs?create=1" },
    { label: "Ajouter un lot", done: lotCount > 0, href: firstProgramId ? `/programs/${firstProgramId}/lots` : "/programs" },
    {
      label: "Générer votre premier contenu",
      done: contentCount > 0,
      href: firstProgramId ? `/programs/${firstProgramId}/generate` : "/programs",
    },
    { label: "Inviter un collègue", done: memberCount > 1, href: "/settings" },
  ];

  const activityItems: ActivityItem[] = recentActivity.map((item) => ({
    id: item.id,
    type: item.type,
    approvalStatus: item.approvalStatus,
    createdAt: item.createdAt,
    programId: item.program.id,
    programName: item.program.name,
    authorName: item.createdBy.name ?? item.createdBy.email,
  }));

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          {organization?.plan && (
            <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300">
              {planLabel(organization.plan)}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Organisation active : {organization?.name ?? organizationId}</p>
      </div>

      <OnboardingChecklist steps={checklistSteps} />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className={`flex items-center gap-3 rounded-3xl border shadow-[0_10px_28px_-10px_rgba(15,23,42,0.16)] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.6)] p-4 ${CARD_ACCENT_STYLES.brand.card}`}>
          <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${CARD_ACCENT_STYLES.brand.badge}`}>
            <Building2 className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Programmes</p>
            <p className="text-2xl font-semibold">{programCount}</p>
          </div>
        </div>
        <div className={`flex items-center gap-3 rounded-3xl border shadow-[0_10px_28px_-10px_rgba(15,23,42,0.16)] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.6)] p-4 ${CARD_ACCENT_STYLES.teal.card}`}>
          <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${CARD_ACCENT_STYLES.teal.badge}`}>
            <FileText className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Contenus générés</p>
            <p className="text-2xl font-semibold">{contentCount}</p>
          </div>
        </div>
        <div className={`flex items-center gap-3 rounded-3xl border shadow-[0_10px_28px_-10px_rgba(15,23,42,0.16)] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.6)] p-4 ${CARD_ACCENT_STYLES.amber.card}`}>
          <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${CARD_ACCENT_STYLES.amber.badge}`}>
            <Zap className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Générations IA ce mois-ci</p>
            <p className="text-2xl font-semibold">
              {usage.quota === null ? (
                "Illimité"
              ) : (
                <>
                  {usage.used}
                  <span className="text-base font-normal text-gray-400"> / {usage.quota}</span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-medium">Programmes récents</h2>
          <Link href="/programs" className="text-sm text-brand-600 hover:underline">
            Voir tous les programmes
          </Link>
        </div>
        {recentPrograms.length === 0 ? (
          <p className="rounded-3xl border dark:border-gray-700 border-dashed p-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Aucun programme pour le moment.{" "}
            <Link href="/programs" className="text-brand-600 hover:underline">
              Créer le premier programme
            </Link>
          </p>
        ) : (
          <ul className="divide-y dark:divide-gray-700 rounded-3xl border dark:border-gray-700 bg-white dark:bg-gray-800 shadow-[0_10px_28px_-10px_rgba(15,23,42,0.16)] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.6)]">
            {recentPrograms.map((program) => (
              <li key={program.id}>
                <Link
                  href={`/programs/${program.id}`}
                  className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <span className="font-medium">{program.name}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{program.city}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ActivityFeed items={activityItems} />
    </div>
  );
}
