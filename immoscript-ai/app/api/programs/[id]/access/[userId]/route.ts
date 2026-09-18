import { NextResponse } from "next/server";
import { withOrgAuth } from "@/lib/with-org-auth";
import { ProgramForbiddenError, ProgramNotFoundError, ProgramService } from "@/lib/services/ProgramService";

type Params = { id: string; userId: string };

export const DELETE = withOrgAuth<Params>(
  async (_req, authContext, { id, userId }) => {
    try {
      await ProgramService.revokeAccess(authContext, id, userId);
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
  { minRole: "PROMOTEUR" }
);
