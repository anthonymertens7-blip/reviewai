import { NextResponse } from "next/server";
import { withOrgAuth } from "@/lib/with-org-auth";
import { LotPhotoService } from "@/lib/services/LotPhotoService";
import { LotNotFoundError } from "@/lib/services/LotService";
import { ProgramForbiddenError } from "@/lib/services/ProgramService";
import { QuotaExceededError, UsageService } from "@/lib/services/UsageService";
import { AIGenerationError, AIService } from "@/lib/ai/AIService";

type Params = { id: string };

// L'analyse vision de plusieurs photos peut être plus lente qu'une génération texte —
// 60s est le maximum configurable sur Vercel Hobby (défaut 10s sans cette ligne).
export const maxDuration = 60;

export const POST = withOrgAuth<Params>(async (_req, authContext, { id }) => {
  try {
    const photos = await LotPhotoService.listWithBytes(authContext, id);

    if (photos.length === 0) {
      return NextResponse.json({ error: "no_photos" }, { status: 400 });
    }

    await UsageService.assertQuotaAndReserve(authContext.organizationId, 1);

    const suggestions = await AIService.suggestFromPhotos(photos);
    return NextResponse.json({ suggestions });
  } catch (error) {
    if (error instanceof LotNotFoundError) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    if (error instanceof ProgramForbiddenError) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
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
