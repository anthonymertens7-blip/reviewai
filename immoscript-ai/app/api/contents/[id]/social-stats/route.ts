import { NextResponse } from "next/server";
import { withOrgAuth } from "@/lib/with-org-auth";
import { ContentNotFoundError, ContentService } from "@/lib/services/ContentService";
import { ProgramForbiddenError, ProgramNotFoundError } from "@/lib/services/ProgramService";
import { socialStatsSchema } from "@/lib/validation/socialStats";

type Params = { id: string };

export const PATCH = withOrgAuth<Params>(async (req, authContext, { id }) => {
  const body = await req.json();
  const parsed = socialStatsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const content = await ContentService.setSocialStats(authContext, id, parsed.data);
    return NextResponse.json({ content });
  } catch (error) {
    if (error instanceof ContentNotFoundError || error instanceof ProgramNotFoundError) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    if (error instanceof ProgramForbiddenError) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    throw error;
  }
});
