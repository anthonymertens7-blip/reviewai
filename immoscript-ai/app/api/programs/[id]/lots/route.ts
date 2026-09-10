import { NextResponse } from "next/server";
import { withOrgAuth } from "@/lib/with-org-auth";
import { LotService } from "@/lib/services/LotService";
import { ProgramForbiddenError, ProgramNotFoundError } from "@/lib/services/ProgramService";
import { createLotSchema } from "@/lib/validation/lot";

type Params = { id: string };

export const POST = withOrgAuth<Params>(
  async (req, authContext, { id }) => {
    const body = await req.json();
    const parsed = createLotSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_payload", details: parsed.error.flatten() }, { status: 400 });
    }

    try {
      const lot = await LotService.create(authContext, id, parsed.data);
      return NextResponse.json({ lot }, { status: 201 });
    } catch (error) {
      if (error instanceof ProgramNotFoundError) {
        return NextResponse.json({ error: "program_not_found" }, { status: 404 });
      }
      if (error instanceof ProgramForbiddenError) {
        return NextResponse.json({ error: "forbidden" }, { status: 403 });
      }
      throw error;
    }
  },
  { minRole: "PROMOTEUR" }
);
