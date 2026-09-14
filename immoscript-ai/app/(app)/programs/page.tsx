import { Role } from "@prisma/client";
import { getAuthContext } from "@/lib/auth";
import { ProgramService } from "@/lib/services/ProgramService";
import { CreateProgramForm } from "@/components/programs/CreateProgramForm";
import { ProgramsList } from "@/components/programs/ProgramsList";
import { computeProgramCompleteness } from "@/lib/programs/completeness";

export default async function ProgramsPage({
  searchParams,
}: {
  searchParams: Promise<{ create?: string }>;
}) {
  const { create } = await searchParams;
  const authContext = await getAuthContext();
  const rawPrograms = await ProgramService.list(authContext);
  const programs = rawPrograms.map((program) => ({
    ...program,
    completenessScore: computeProgramCompleteness(program, program.lots).score,
  }));
  const canCreate = authContext.role !== Role.COLLABORATEUR;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-semibold">Programmes</h1>

      {canCreate && <CreateProgramForm defaultOpen={create === "1"} />}

      {programs.length === 0 ? (
        <p className="rounded-3xl border dark:border-gray-700 border-dashed p-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Aucun programme accessible pour le moment.
        </p>
      ) : (
        <ProgramsList programs={programs} />
      )}
    </div>
  );
}
