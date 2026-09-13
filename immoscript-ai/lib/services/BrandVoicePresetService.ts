import type { AuthContext } from "@/lib/auth";
import type { CreateBrandVoicePresetInput } from "@/lib/validation/brandVoicePreset";

export class BrandVoicePresetNotFoundError extends Error {}

/** Préréglages de ton/marque partagés par toute l'organisation (ex: "Luxe", "Familial"). */
export class BrandVoicePresetService {
  static async list(authContext: AuthContext) {
    return authContext.db.brandVoicePreset.findMany({
      where: { organizationId: authContext.organizationId },
      orderBy: { createdAt: "asc" },
    });
  }

  static async create(authContext: AuthContext, input: CreateBrandVoicePresetInput) {
    return authContext.db.brandVoicePreset.create({
      data: { ...input, organizationId: authContext.organizationId },
    });
  }

  static async remove(authContext: AuthContext, presetId: string) {
    const preset = await authContext.db.brandVoicePreset.findUnique({ where: { id: presetId } });
    if (!preset || preset.organizationId !== authContext.organizationId) {
      throw new BrandVoicePresetNotFoundError(presetId);
    }
    return authContext.db.brandVoicePreset.delete({ where: { id: presetId } });
  }
}
