import { Role } from "@prisma/client";
import { getAuthContext } from "@/lib/auth";
import { ProgramService } from "@/lib/services/ProgramService";
import { CreateProgramForm } from "@/components/programs/CreateProgramForm";
import { ProgramsList } from "@/components/programs/ProgramsList";

export default async function ProgramsPage() {
  const authContext = await getAuthContext();
  const programs = await ProgramService.list(authContext);
  const canCreate = authContext.role !== Role.COLLABORATEUR;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-semibold">Programmes</h1>

      {canCreate && <CreateProgramForm />}

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
