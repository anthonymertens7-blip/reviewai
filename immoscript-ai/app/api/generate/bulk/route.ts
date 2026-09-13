import { NextResponse } from "next/server";
import { withOrgAuth } from "@/lib/with-org-auth";
import { ContentService, NoLotsError } from "@/lib/services/ContentService";
import { ProgramForbiddenError, ProgramNotFoundError } from "@/lib/services/ProgramService";
import { QuotaExceededError } from "@/lib/services/UsageService";
import { generateBulkSchema } from "@/lib/validation/generate";
import { AIGenerationError } from "@/lib/ai/AIService";

export const POST = withOrgAuth(async (req, authContext) => {
  const body = await req.json();
  const parsed = generateBulkSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const { programId, requestedTypes, angle, duration, ...marketing } = parsed.data;

  try {
    const results = await ContentService.generateForAllLots(authContext, {
      programId,
      requestedTypes,
      angle,
      duration,
      marketing,
    });

    return NextResponse.json({ results });
  } catch (error) {
    if (error instanceof ProgramNotFoundError) {
      return NextResponse.json({ error: "program_not_found" }, { status: 404 });
    }
    if (error instanceof ProgramForbiddenError) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    if (error instanceof NoLotsError) {
      return NextResponse.json({ error: "no_lots" }, { status: 400 });
    }
    if (error instanceof QuotaExceededError) {
      return NextResponse.json({ error: "quota_exceeded", message: error.message }, { status: 429 });
    }
    if (error instanceof AIGenerationError) {
      return NextResponse.json({ error: "ai_generation_failed", message: error.message }, { status: 502 });
    }
    throw error;
  }
});
