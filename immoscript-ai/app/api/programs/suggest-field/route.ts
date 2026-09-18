import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { z } from "zod";
import { withOrgAuth } from "@/lib/with-org-auth";
import { AIService, AIGenerationError } from "@/lib/ai/AIService";
import { UsageService, QuotaExceededError } from "@/lib/services/UsageService";
import { SUGGESTIBLE_FIELDS } from "@/lib/ai/prompts/fieldSuggestion";

const contextSchema = z.object({
  address: z.string().min(1),
  city: z.string().min(1),
  district: z.string().optional(),
  programType: z.string().optional(),
  unitsCount: z.string().optional(),
  deliveryDate: z.string().optional(),
  environment: z.string().optional(),
  transport: z.string().optional(),
  schools: z.string().optional(),
  shops: z.string().optional(),
  pointsOfInterest: z.string().optional(),
  amenities: z.string().optional(),
});

const bodySchema = z.object({
  context: contextSchema,
  field: z.enum(SUGGESTIBLE_FIELDS),
});

// 60s est le maximum configurable sur Vercel Hobby (défaut 10s sans cette ligne).
export const maxDuration = 60;

export const POST = withOrgAuth(async (req, authContext) => {
  const body = await req.json();
  const parsed = bodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    await UsageService.assertQuotaAndReserve(authContext.organizationId, 1);

    let suggestions;
    try {
      suggestions = await AIService.suggestField(parsed.data.context, parsed.data.field);
    } catch (aiError) {
      // Le quota a été réservé avant l'appel IA : s'il échoue, même pour une erreur SDK brute et
      // pas seulement une AIGenerationError, l'unité réservée doit être rendue (voir le même
      // principe sur /api/lots/[id]/photos/suggest et ContentService.generateBatch/regenerate).
      await UsageService.release(authContext.organizationId, 1);
      throw aiError;
    }
    return NextResponse.json({ suggestions });
  } catch (error) {
    if (error instanceof QuotaExceededError) {
      return NextResponse.json({ error: "quota_exceeded", message: error.message }, { status: 429 });
    }
    if (error instanceof AIGenerationError) {
      return NextResponse.json({ error: "ai_generation_failed", message: error.message }, { status: 502 });
    }
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json({ error: "ai_generation_failed", message: error.message }, { status: 502 });
    }
    throw error;
  }
});
