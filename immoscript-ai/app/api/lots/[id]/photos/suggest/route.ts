import Anthropic from "@anthropic-ai/sdk";
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

    let suggestions;
    try {
      suggestions = await AIService.suggestFromPhotos(photos);
    } catch (aiError) {
      // Le quota a été réservé avant l'appel IA (voir UsageService.assertQuotaAndReserve) : s'il
      // échoue, même pour une erreur SDK brute (image invalide, service indisponible...) et pas
      // seulement une AIGenerationError, l'unité réservée doit être rendue.
      await UsageService.release(authContext.organizationId, 1);
      throw aiError;
    }
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
    // Erreur SDK Anthropic brute (image invalide, service indisponible, quota fournisseur...) : pas
    // une AIGenerationError (celle-ci enveloppe une sortie mal formée, pas un échec de l'appel
    // lui-même), mais reste une défaillance côté IA à renvoyer proprement plutôt qu'un 500 opaque.
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json({ error: "ai_generation_failed", message: error.message }, { status: 502 });
    }
    throw error;
  }
});
