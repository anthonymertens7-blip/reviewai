import { NextResponse } from "next/server";
import { withOrgAuth } from "@/lib/with-org-auth";
import { ProgramForbiddenError, ProgramNotFoundError, ProgramService } from "@/lib/services/ProgramService";

type Params = { id: string };

export const POST = withOrgAuth<Params>(
  async (_req, authContext, { id }) => {
    try {
      const program = await ProgramService.duplicate(authContext, id);
      return NextResponse.json({ program }, { status: 201 });
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
