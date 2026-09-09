import { NextResponse } from "next/server";
import { withOrgAuth } from "@/lib/with-org-auth";
import { ProgramForbiddenError, ProgramNotFoundError, ProgramService } from "@/lib/services/ProgramService";
import { updateProgramSchema } from "@/lib/validation/program";

type Params = { id: string };

export const GET = withOrgAuth<Params>(async (_req, authContext, { id }) => {
  try {
    const program = await ProgramService.get(authContext, id);
    return NextResponse.json({ program });
  } catch (error) {
    if (error instanceof ProgramNotFoundError) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    if (error instanceof ProgramForbiddenError) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    throw error;
  }
});

export const PATCH = withOrgAuth<Params>(
  async (req, authContext, { id }) => {
    const body = await req.json();
    const parsed = updateProgramSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_payload", details: parsed.error.flatten() }, { status: 400 });
    }

    try {
      const program = await ProgramService.update(authContext, id, parsed.data);
      return NextResponse.json({ program });
    } catch (error) {
      if (error instanceof ProgramNotFoundError) {
        return NextResponse.json({ error: "not_found" }, { status: 404 });
      }
      if (error instanceof ProgramForbiddenError) {
        return NextResponse.json({ error: "forbidden" }, { status: 403 });
      }
      throw error;
    }
  },
  { minRole: "PROMOTEUR" }
);

export const DELETE = withOrgAuth<Params>(
  async (_req, authContext, { id }) => {
    try {
      await ProgramService.remove(authContext, id);
      return new NextResponse(null, { status: 204 });
    } catch (error) {
      if (error instanceof ProgramNotFoundError) {
        return NextResponse.json({ error: "not_found" }, { status: 404 });
      }
      if (error instanceof ProgramForbiddenError) {
        return NextResponse.json({ error: "forbidden" }, { status: 403 });
      }
      throw error;
    }
  },
  { minRole: "ADMIN" }
);
