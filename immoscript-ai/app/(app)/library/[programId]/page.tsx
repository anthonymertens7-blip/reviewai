import Link from "next/link";
import { notFound } from "next/navigation";
import { getAuthContext } from "@/lib/auth";
import { ProgramForbiddenError, ProgramNotFoundError, ProgramService } from "@/lib/services/ProgramService";
import { ContentCard } from "@/components/results/ContentCard";
import { CONTENT_TYPES } from "@/lib/ai/types";
import { CONTENT_TYPE_LABELS } from "@/lib/ai/labels";

export default async function ProgramLibraryPage({
  params,
  searchParams,
}: {
  params: Promise<{ programId: string }>;
  searchParams: Promise<{ type?: string; lotId?: string }>;
}) {
  const { programId } = await params;
  const { type, lotId } = await searchParams;
  const authContext = await getAuthContext();

  let program;
  try {
    program = await ProgramService.get(authContext, programId);
  } catch (error) {
    if (error instanceof ProgramNotFoundError || error instanceof ProgramForbiddenError) {
      notFound();
    }
    throw error;
  }

  const contents = await authContext.db.generatedContent.findMany({
    where: {
      programId,
      status: { not: "archived" },
      ...(type ? { type } : {}),
      ...(lotId ? { lotId } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link href="/library" className="text-sm text-brand-600 hover:underline">
          ← Tous les programmes
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">{program.name}</h1>
        <p className="text-sm text-gray-500">{contents.length} contenu(s)</p>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4" method="get">
        <div>
          <label htmlFor="type" className="mb-1 block text-sm font-medium text-gray-700">
            Type de contenu
          </label>
          <select id="type" name="type" defaultValue={type ?? ""} className="rounded-md border-gray-300 text-sm">
            <option value="">Tous les types</option>
            {CONTENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {CONTENT_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>

        {program.lots.length > 0 && (
          <div>
            <label htmlFor="lotId" className="mb-1 block text-sm font-medium text-gray-700">
              Lot
            </label>
            <select id="lotId" name="lotId" defaultValue={lotId ?? ""} className="rounded-md border-gray-300 text-sm">
              <option value="">Tous les lots + programme</option>
              {program.lots.map((lot) => (
                <option key={lot.id} value={lot.id}>
                  {lot.reference}
                </option>
              ))}
            </select>
          </div>
        )}

        <button type="submit" className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50">
          Filtrer
        </button>
        {(type || lotId) && (
          <Link href={`/library/${programId}`} className="text-sm text-gray-500 hover:underline">
            Réinitialiser
          </Link>
        )}
      </form>

      {contents.length === 0 ? (
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-gray-500">
          Aucun contenu ne correspond à ces filtres.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {contents.map((content) => (
            <ContentCard key={content.id} data={content} />
          ))}
        </div>
      )}
    </div>
  );
}
