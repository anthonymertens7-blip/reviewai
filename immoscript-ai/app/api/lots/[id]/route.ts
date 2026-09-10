import { NextResponse } from "next/server";
import { withOrgAuth } from "@/lib/with-org-auth";
import { LotNotFoundError, LotService } from "@/lib/services/LotService";
import { ProgramForbiddenError } from "@/lib/services/ProgramService";
import { updateLotSchema } from "@/lib/validation/lot";

type Params = { id: string };

export const PATCH = withOrgAuth<Params>(
  async (req, authContext, { id }) => {
    const body = await req.json();
    const parsed = updateLotSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_payload", details: parsed.error.flatten() }, { status: 400 });
    }

    try {
      const lot = await LotService.update(authContext, id, parsed.data);
      return NextResponse.json({ lot });
    } catch (error) {
      if (error instanceof LotNotFoundError) {
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
      await LotService.remove(authContext, id);
      return new NextResponse(null, { status: 204 });
    } catch (error) {
      if (error instanceof LotNotFoundError) {
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
