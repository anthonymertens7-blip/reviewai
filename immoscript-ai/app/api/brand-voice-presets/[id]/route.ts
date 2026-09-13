import { NextResponse } from "next/server";
import { withOrgAuth } from "@/lib/with-org-auth";
import { BrandVoicePresetNotFoundError, BrandVoicePresetService } from "@/lib/services/BrandVoicePresetService";

type Params = { id: string };

export const DELETE = withOrgAuth<Params>(
  async (_req, authContext, { id }) => {
    try {
      await BrandVoicePresetService.remove(authContext, id);
      return new NextResponse(null, { status: 204 });
    } catch (error) {
      if (error instanceof BrandVoicePresetNotFoundError) {
        return NextResponse.json({ error: "not_found" }, { status: 404 });
      }
      throw error;
    }
  },
  { minRole: "PROMOTEUR" }
);
