import { NextResponse } from "next/server";
import { withOrgAuth } from "@/lib/with-org-auth";
import { ContentService, LotNotFoundError } from "@/lib/services/ContentService";
import { ProgramForbiddenError, ProgramNotFoundError } from "@/lib/services/ProgramService";
import { generateBatchSchema } from "@/lib/validation/generate";
import { AIGenerationError } from "@/lib/ai/AIService";

export const POST = withOrgAuth(async (req, authContext) => {
  const body = await req.json();
  const parsed = generateBatchSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const { programId, lotId, requestedTypes, angle, duration, ...marketing } = parsed.data;

  try {
    const { generationRequest, contents, errors } = await ContentService.generateBatch(authContext, {
      programId,
      lotId,
      requestedTypes,
      angle,
      duration,
      marketing,
    });

    return NextResponse.json(
      { generationRequest, contents, errors },
      { status: errors.length > 0 && contents.length === 0 ? 502 : 201 }
    );
  } catch (error) {
    if (error instanceof ProgramNotFoundError) {
      return NextResponse.json({ error: "program_not_found" }, { status: 404 });
    }
    if (error instanceof ProgramForbiddenError) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    if (error instanceof LotNotFoundError) {
      return NextResponse.json({ error: "lot_not_found" }, { status: 404 });
    }
    if (error instanceof AIGenerationError) {
      return NextResponse.json({ error: "ai_generation_failed", message: error.message }, { status: 502 });
    }
    throw error;
  }
});
