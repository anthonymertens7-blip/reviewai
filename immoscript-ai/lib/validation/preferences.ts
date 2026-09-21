import { z } from "zod";
import { BACKGROUND_PRESET_IDS } from "@/lib/appearance/backgroundPresets";

export const updatePreferencesSchema = z.object({
  backgroundPreset: z.enum(BACKGROUND_PRESET_IDS),
});

export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
