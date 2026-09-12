import { NextResponse } from "next/server";
import { withOrgAuth } from "@/lib/with-org-auth";
import { ProgramForbiddenError, ProgramNotFoundError, ProgramService } from "@/lib/services/ProgramService";
import { buildDocx } from "@/lib/export/toDocx";
import { buildPdf } from "@/lib/export/toPdf";
import type { ContentType } from "@/lib/ai/types";

type Params = { id: string };

export const GET = withOrgAuth<Params>(async (req, authContext, { id }) => {
  const format = new URL(req.url).searchParams.get("format");
  if (format !== "pdf" && format !== "docx") {
    return NextResponse.json({ error: "invalid_format" }, { status: 400 });
  }

  const existing = await authContext.db.generatedContent.findUnique({
    where: { id },
    include: { lot: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  let program;
  try {
    program = await ProgramService.get(authContext, existing.programId);
  } catch (error) {
    if (error instanceof ProgramNotFoundError) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    if (error instanceof ProgramForbiddenError) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    throw error;
  }

  const type = existing.type as ContentType;
  const contextLabel = existing.lot ? `${program.name} · ${existing.lot.reference}` : program.name;

  const buffer =
    format === "pdf" ? await buildPdf(type, existing.content, contextLabel) : await buildDocx(type, existing.content, contextLabel);

  const contentType = format === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  const filename = `${program.name}-${type}.${format}`.replace(/[^a-zA-Z0-9._-]+/g, "_");

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
});
