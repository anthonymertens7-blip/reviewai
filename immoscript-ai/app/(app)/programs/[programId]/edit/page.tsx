import Link from "next/link";
import { notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { getAuthContext } from "@/lib/auth";
import { ProgramForbiddenError, ProgramNotFoundError, ProgramService } from "@/lib/services/ProgramService";
import { ProgramForm, type ProgramFormValues } from "@/components/programs/ProgramForm";

export default async function EditProgramPage({
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

  if (authContext.role === Role.COLLABORATEUR) {
    return (
      <div className="mx-auto max-w-2xl">
        <p className="rounded-3xl border dark:border-gray-700 border-dashed p-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Vous n&apos;avez pas les droits pour modifier ce programme.
        </p>
      </div>
    );
  }

  const initialValues: ProgramFormValues = {
    name: program.name,
    city: program.city,
    address: program.address ?? "",
    district: program.district ?? "",
    programType: program.programType ?? "",
    unitsCount: program.unitsCount?.toString() ?? "",
    deliveryDate: program.deliveryDate ? program.deliveryDate.toISOString().slice(0, 10) : "",
    description: program.description ?? "",
    environment: program.environment ?? "",
    transport: program.transport ?? "",
    schools: program.schools ?? "",
    shops: program.shops ?? "",
    pointsOfInterest: program.pointsOfInterest ?? "",
    amenities: program.amenities ?? "",
    features: program.features ?? "",
    advantages: program.advantages ?? "",
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link href={`/programs/${programId}`} className="text-sm text-brand-600 hover:underline">
          ← {program.name}
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">Modifier le programme</h1>
      </div>
      <ProgramForm mode="edit" programId={programId} initialValues={initialValues} />
    </div>
  );
}
