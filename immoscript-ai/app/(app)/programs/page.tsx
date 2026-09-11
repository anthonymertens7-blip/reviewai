import Link from "next/link";
import { Role } from "@prisma/client";
import { getAuthContext } from "@/lib/auth";
import { ProgramService } from "@/lib/services/ProgramService";
import { CreateProgramForm } from "@/components/programs/CreateProgramForm";

export default async function ProgramsPage() {
  const authContext = await getAuthContext();
  const programs = await ProgramService.list(authContext);
  const canCreate = authContext.role !== Role.COLLABORATEUR;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-semibold">Programmes</h1>

      {canCreate && <CreateProgramForm />}

      {programs.length === 0 ? (
        <p className="rounded-3xl border border-dashed p-6 text-center text-sm text-gray-500">
          Aucun programme accessible pour le moment.
        </p>
      ) : (
        <ul className="divide-y rounded-3xl border bg-white">
          {programs.map((program) => (
            <li key={program.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <Link href={`/programs/${program.id}`} className="font-medium hover:underline">
                  {program.name}
                </Link>
                <p className="text-sm text-gray-500">{program.city}</p>
              </div>
              {program.programType && (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                  {program.programType}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
