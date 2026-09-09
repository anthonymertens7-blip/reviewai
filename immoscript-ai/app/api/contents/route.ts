import { NextResponse } from "next/server";
import { withOrgAuth } from "@/lib/with-org-auth";
import { ProgramForbiddenError, ProgramNotFoundError, ProgramService } from "@/lib/services/ProgramService";

export const GET = withOrgAuth(async (req, authContext) => {
  const programId = new URL(req.url).searchParams.get("programId");

  if (!programId) {
    return NextResponse.json({ error: "programId_required" }, { status: 400 });
  }

  try {
    // Vérifie l'accès au programme (scoping Collaborateur inclus) avant de lister.
    await ProgramService.get(authContext, programId);
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
    where: { programId, status: { not: "archived" } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ contents });
});
