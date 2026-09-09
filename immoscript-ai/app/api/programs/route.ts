import { NextResponse } from "next/server";
import { withOrgAuth } from "@/lib/with-org-auth";
import { ProgramService } from "@/lib/services/ProgramService";
import { createProgramSchema } from "@/lib/validation/program";

export const GET = withOrgAuth(async (_req, authContext) => {
  const programs = await ProgramService.list(authContext);
  return NextResponse.json({ programs });
});

export const POST = withOrgAuth(
  async (req, authContext) => {
    const body = await req.json();
    const parsed = createProgramSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_payload", details: parsed.error.flatten() }, { status: 400 });
    }

    const program = await ProgramService.create(authContext, parsed.data);
    return NextResponse.json({ program }, { status: 201 });
  },
  { minRole: "PROMOTEUR" }
);
