import { NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { withOrgAuth } from "@/lib/with-org-auth";
import { ProgramForbiddenError, ProgramNotFoundError, ProgramService } from "@/lib/services/ProgramService";

type Params = { id: string };

const updateContentSchema = z.object({
  content: z.record(z.unknown()),
});

export const PATCH = withOrgAuth<Params>(async (req, authContext, { id }) => {
  const body = await req.json();
  const parsed = updateContentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await authContext.db.generatedContent.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  try {
    await ProgramService.get(authContext, existing.programId);
  } catch (error) {
    if (error instanceof ProgramNotFoundError) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    if (error instanceof ProgramForbiddenError) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    throw error;
  }

  const content = await authContext.db.generatedContent.update({
    where: { id },
    data: {
      content: parsed.data.content as Prisma.InputJsonValue,
      status: "edited",
      editedByUserId: authContext.userId,
    },
  });

  return NextResponse.json({ content });
});
