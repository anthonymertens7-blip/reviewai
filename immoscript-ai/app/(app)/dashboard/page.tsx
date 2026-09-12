import Link from "next/link";
import { Building2, FileText } from "lucide-react";
import { getAuthContext } from "@/lib/auth";
import { CARD_ACCENT_STYLES } from "@/components/ui/cardAccents";

export default async function DashboardPage() {
  const { db, organizationId } = await getAuthContext();

  const [organization, programCount, contentCount, recentPrograms] = await Promise.all([
    db.organization.findUnique({ where: { id: organizationId }, select: { name: true } }),
    db.program.count(),
    db.generatedContent.count({ where: { status: { not: "archived" } } }),
    db.program.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, name: true, city: true, updatedAt: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Organisation active : {organization?.name ?? organizationId}</p>
      </div>

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
              <li key={program.id} className="flex items-center justify-between px-4 py-3">
                <Link href={`/programs/${program.id}`} className="font-medium hover:underline">
                  {program.name}
                </Link>
                <span className="text-sm text-gray-500 dark:text-gray-400">{program.city}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
