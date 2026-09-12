import { NextResponse } from "next/server";
import { z } from "zod";
import { withOrgAuth } from "@/lib/with-org-auth";
import { AIService, AIGenerationError } from "@/lib/ai/AIService";
import { SUGGESTIBLE_FIELDS } from "@/lib/ai/prompts/fieldSuggestion";

const bodySchema = z.object({
  address: z.string().min(1),
  city: z.string().min(1),
  field: z.enum(SUGGESTIBLE_FIELDS),
});

export const POST = withOrgAuth(async (req) => {
  const body = await req.json();
  const parsed = bodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const suggestions = await AIService.suggestField(parsed.data.address, parsed.data.city, parsed.data.field);
    return NextResponse.json({ suggestions });
  } catch (error) {
    if (error instanceof AIGenerationError) {
      return NextResponse.json({ error: "ai_generation_failed", message: error.message }, { status: 502 });
    }
    throw error;
  }
});
