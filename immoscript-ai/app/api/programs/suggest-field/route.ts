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
    const suggestions = await AIService.suggestField(parsed.data.context, parsed.data.field);
    return NextResponse.json({ suggestions });
  } catch (error) {
    if (error instanceof QuotaExceededError) {
      return NextResponse.json({ error: "quota_exceeded", message: error.message }, { status: 429 });
    }
    if (error instanceof AIGenerationError) {
      return NextResponse.json({ error: "ai_generation_failed", message: error.message }, { status: 502 });
    }
    throw error;
  }
});
