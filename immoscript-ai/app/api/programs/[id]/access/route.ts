import { NextResponse } from "next/server";
import { z } from "zod";
import { withOrgAuth } from "@/lib/with-org-auth";
import { ProgramForbiddenError, ProgramNotFoundError, ProgramService, UserNotInOrganizationError } from "@/lib/services/ProgramService";

type Params = { id: string };

const grantAccessSchema = z.object({ userId: z.string().min(1) });

export const GET = withOrgAuth<Params>(
  async (_req, authContext, { id }) => {
    try {
      const userIds = await ProgramService.listAccess(authContext, id);
      return NextResponse.json({ userIds });
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

export const POST = withOrgAuth<Params>(
  async (req, authContext, { id }) => {
    const body = await req.json();
    const parsed = grantAccessSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_payload", details: parsed.error.flatten() }, { status: 400 });
    }

    try {
      await ProgramService.grantAccess(authContext, id, parsed.data.userId);
      return NextResponse.json({ ok: true }, { status: 201 });
    } catch (error) {
      if (error instanceof ProgramNotFoundError) {
        return NextResponse.json({ error: "not_found" }, { status: 404 });
      }
      if (error instanceof ProgramForbiddenError) {
        return NextResponse.json({ error: "forbidden" }, { status: 403 });
      }
      if (error instanceof UserNotInOrganizationError) {
        return NextResponse.json({ error: "user_not_found" }, { status: 400 });
      }
      throw error;
    }
  },
  { minRole: "PROMOTEUR" }
);
