import { NextResponse } from "next/server";
import { withOrgAuth } from "@/lib/with-org-auth";
import { ProgramForbiddenError, ProgramNotFoundError, ProgramService } from "@/lib/services/ProgramService";
import { buildMandatoryMentionsText } from "@/lib/legal/mandatoryMentions";
import { buildCsv } from "@/lib/export/toCsv";
import type { ListingOutput } from "@/lib/ai/schemas";

type Params = { id: string };

const LISTING_TYPES = ["listing_full", "listing_short", "portal", "website"];

const COLUMNS = [
  "Référence lot",
  "Type de bien",
  "Surface (m²)",
  "Pièces",
  "Prix (€)",
  "Ville",
  "Adresse",
  "Titre annonce",
  "Description",
  "Points forts",
  "Appel à l'action",
  "Mentions légales",
];

export const GET = withOrgAuth<Params>(async (_req, authContext, { id }) => {
  let program;
  try {
    program = await ProgramService.get(authContext, id);
  } catch (error) {
    if (error instanceof ProgramNotFoundError) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    if (error instanceof ProgramForbiddenError) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    throw error;
  }

  const contents = await authContext.db.generatedContent.findMany({
    where: { programId: id, status: { not: "archived" }, type: { in: LISTING_TYPES } },
    orderBy: { createdAt: "desc" },
  });

  function bestContentFor(lotId: string | null) {
    return (
      contents.find((c) => c.lotId === lotId && c.type === "listing_full") ??
      contents.find((c) => c.lotId === lotId)
    );
  }

  const rows = program.lots.map((lot) => {
    const best = bestContentFor(lot.id);
    const listing = best?.content as ListingOutput | undefined;
    return {
      "Référence lot": lot.reference,
      "Type de bien": lot.propertyType,
      "Surface (m²)": lot.livingArea?.toString() ?? "",
      Pièces: lot.roomsCount?.toString() ?? "",
      "Prix (€)": lot.price?.toString() ?? "",
      Ville: program.city,
      Adresse: program.address ?? "",
      "Titre annonce": listing?.title ?? "",
      Description: listing?.description ?? "",
      "Points forts": listing?.highlights?.join(" | ") ?? "",
      "Appel à l'action": listing?.cta ?? "",
      "Mentions légales": buildMandatoryMentionsText(program, lot)?.replace(/\n/g, " | ") ?? "",
    };
  });

  const csv = buildCsv(COLUMNS, rows);
  const filename = `${program.name}-lots.csv`.replace(/[^a-zA-Z0-9._-]+/g, "_");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
});
