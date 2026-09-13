import { NextResponse } from "next/server";
import { withOrgAuth } from "@/lib/with-org-auth";
import { BrandVoicePresetService } from "@/lib/services/BrandVoicePresetService";
import { createBrandVoicePresetSchema } from "@/lib/validation/brandVoicePreset";

export const GET = withOrgAuth(async (_req, authContext) => {
  const presets = await BrandVoicePresetService.list(authContext);
  return NextResponse.json({ presets });
});

export const POST = withOrgAuth(
  async (req, authContext) => {
    const body = await req.json();
    const parsed = createBrandVoicePresetSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_payload", details: parsed.error.flatten() }, { status: 400 });
    }

    const preset = await BrandVoicePresetService.create(authContext, parsed.data);
    return NextResponse.json({ preset }, { status: 201 });
  },
  { minRole: "PROMOTEUR" }
);
