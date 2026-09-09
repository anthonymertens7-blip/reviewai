import { notFound } from "next/navigation";
import { getAuthContext } from "@/lib/auth";
import { ProgramForbiddenError, ProgramNotFoundError, ProgramService } from "@/lib/services/ProgramService";
import { GeneratorForm } from "@/components/generator/GeneratorForm";

export default async function GeneratePage({
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
        <h1 className="text-2xl font-semibold">Générer du contenu</h1>
        <p className="text-sm text-gray-500">{program.name}</p>
      </div>
      <GeneratorForm programId={program.id} lots={program.lots} />
    </div>
  );
}
