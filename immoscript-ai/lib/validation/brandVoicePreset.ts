import { z } from "zod";

export const createBrandVoicePresetSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  target: z.string().optional(),
  tone: z.string().optional(),
  mainArgument: z.string().optional(),
  cta: z.string().optional(),
});

export type CreateBrandVoicePresetInput = z.infer<typeof createBrandVoicePresetSchema>;
