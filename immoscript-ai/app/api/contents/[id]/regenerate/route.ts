import { NextResponse } from "next/server";
import { withOrgAuth } from "@/lib/with-org-auth";
import { ContentNotFoundError, ContentService } from "@/lib/services/ContentService";
import { ProgramForbiddenError, ProgramNotFoundError } from "@/lib/services/ProgramService";
import { AIGenerationError } from "@/lib/ai/AIService";

type Params = { id: string };

export const POST = withOrgAuth<Params>(async (_req, authContext, { id }) => {
  try {
    const content = await ContentService.regenerate(authContext, id);
    return NextResponse.json({ content }, { status: 201 });
  } catch (error) {
    if (error instanceof ContentNotFoundError || error instanceof ProgramNotFoundError) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    if (error instanceof ProgramForbiddenError) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    if (error instanceof AIGenerationError) {
      return NextResponse.json({ error: "ai_generation_failed", message: error.message }, { status: 502 });
    }
    throw error;
  }
});
