import Link from "next/link";
import { getAuthContext } from "@/lib/auth";
import { ProgramService } from "@/lib/services/ProgramService";

export default async function LibraryPage() {
  const authContext = await getAuthContext();
  const programs = await ProgramService.list(authContext);

  const programsWithCounts = await Promise.all(
    programs.map(async (program) => ({
      program,
      count: await authContext.db.generatedContent.count({
        where: { programId: program.id, status: { not: "archived" } },
      }),
    }))
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-semibold">Bibliothèque</h1>
      <p className="text-sm text-gray-500">Historique des contenus générés, par programme.</p>

      {programsWithCounts.length === 0 ? (
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-gray-500">
          Aucun programme accessible pour le moment.
        </p>
      ) : (
        <ul className="divide-y rounded-lg border bg-white">
          {programsWithCounts.map(({ program, count }) => (
            <li key={program.id} className="flex items-center justify-between px-4 py-3">
              <Link href={`/programs/${program.id}`} className="font-medium hover:underline">
                {program.name}
              </Link>
              <span className="text-sm text-gray-500">{count} contenu(s)</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
