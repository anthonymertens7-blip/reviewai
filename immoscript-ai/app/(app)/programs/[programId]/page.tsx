import Link from "next/link";
import { notFound } from "next/navigation";
import { History, Pencil, Sparkles } from "lucide-react";
import { getAuthContext } from "@/lib/auth";
import { ProgramForbiddenError, ProgramNotFoundError, ProgramService } from "@/lib/services/ProgramService";

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ programId: string }>;
}) {
  const { programId } = await params;
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

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{program.name}</h1>
          <p className="text-sm text-gray-500">
            {program.address ? `${program.address}, ` : ""}
            {program.city}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/programs/${program.id}/edit`}
            className="flex items-center gap-1.5 rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
          >
            <Pencil className="h-4 w-4" />
            Modifier
          </Link>
          <Link
            href={`/library/${program.id}`}
            className="flex items-center gap-1.5 rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
          >
            <History className="h-4 w-4" />
            Historique
          </Link>
          <Link
            href={`/programs/${program.id}/generate`}
            className="flex items-center gap-1.5 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            <Sparkles className="h-4 w-4" />
            Générer du contenu
          </Link>
        </div>
      </div>

      {program.description && <p className="text-sm text-gray-700">{program.description}</p>}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-medium">Lots ({program.lots.length})</h2>
          <Link href={`/programs/${program.id}/lots`} className="text-sm text-brand-600 hover:underline">
            Gérer les lots
          </Link>
        </div>
        {program.lots.length === 0 ? (
          <p className="rounded-3xl border border-dashed p-6 text-center text-sm text-gray-500">
            Aucun lot pour le moment.
          </p>
        ) : (
          <ul className="divide-y rounded-3xl border bg-white">
            {program.lots.map((lot) => (
              <li key={lot.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="font-medium">{lot.reference}</span>
                <span className="text-gray-500">
                  {lot.propertyType}
                  {lot.livingArea ? ` · ${lot.livingArea} m²` : ""}
                  {lot.price ? ` · ${lot.price.toLocaleString("fr-FR")} €` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
