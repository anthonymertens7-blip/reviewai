import Link from "next/link";
import { notFound } from "next/navigation";
import { getAuthContext } from "@/lib/auth";
import { ProgramForbiddenError, ProgramNotFoundError, ProgramService } from "@/lib/services/ProgramService";
import { LotForm } from "@/components/lots/LotForm";
import { DeleteLotButton } from "@/components/lots/DeleteLotButton";

export default async function ProgramLotsPage({
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
      <div>
        <Link href={`/programs/${programId}`} className="text-sm text-blue-600 hover:underline">
          ← {program.name}
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">Lots</h1>
      </div>

      <LotForm programId={programId} />

      {program.lots.length === 0 ? (
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-gray-500">
          Aucun lot pour le moment.
        </p>
      ) : (
        <ul className="divide-y rounded-lg border bg-white">
          {program.lots.map((lot) => (
            <li key={lot.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div>
                <p className="font-medium">
                  {lot.reference} — {lot.propertyType}
                  {lot.roomsCount ? ` · ${lot.roomsCount} pièces` : ""}
                  {lot.livingArea ? ` · ${lot.livingArea} m²` : ""}
                </p>
                <p className="text-sm text-gray-500">
                  {lot.price ? `${lot.price.toLocaleString("fr-FR")} € · ` : ""}
                  {lot.availability ?? "disponibilité non renseignée"}
                </p>
              </div>
              <DeleteLotButton lotId={lot.id} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
