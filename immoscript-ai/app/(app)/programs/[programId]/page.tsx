import Link from "next/link";
import { notFound } from "next/navigation";
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{program.name}</h1>
          <p className="text-sm text-gray-500">
            {program.address ? `${program.address}, ` : ""}
            {program.city}
          </p>
        </div>
        <Link
          href={`/programs/${program.id}/generate`}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Générer du contenu
        </Link>
      </div>

      {program.description && <p className="text-sm text-gray-700">{program.description}</p>}

      <div>
        <h2 className="mb-3 text-lg font-medium">Lots ({program.lots.length})</h2>
        {program.lots.length === 0 ? (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-gray-500">
            Aucun lot pour le moment.
          </p>
        ) : (
          <ul className="divide-y rounded-lg border bg-white">
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
