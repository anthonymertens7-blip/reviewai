import Link from "next/link";
import { notFound } from "next/navigation";
import { getAuthContext } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProgramForbiddenError, ProgramNotFoundError, ProgramService } from "@/lib/services/ProgramService";
import { BrandVoicePresetService } from "@/lib/services/BrandVoicePresetService";
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

  const brandVoicePresets = await BrandVoicePresetService.list(authContext);

  // Même justification que app/api/billing/checkout/route.ts pour la lecture directe via
  // `prisma` plutôt que le client scopé : Organization n'appartient à aucune organisation, c'est
  // elle-même l'entité scopée. N'affecte que l'aperçu (teaser flouté) en plan gratuit, jamais le
  // contenu réellement enregistré.
  const org = await prisma.organization.findUniqueOrThrow({ where: { id: authContext.organizationId }, select: { plan: true } });
  const isTrial = org.plan === "trial";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link href={`/programs/${programId}`} className="text-sm text-brand-600 hover:underline">
          ← {program.name}
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">Générer du contenu</h1>
      </div>
      <GeneratorForm
        programId={program.id}
        lots={program.lots}
        programIsCoOwnership={program.isCoOwnership}
        programCondoLotsCount={program.condoLotsCount}
        brandVoicePresets={brandVoicePresets}
        isTrial={isTrial}
      />
    </div>
  );
}
