import { z } from "zod";
import { CONTENT_TYPES, VIDEO_ANGLES } from "@/lib/ai/types";

export const generateBatchSchema = z.object({
  programId: z.string().min(1),
  lotId: z.string().min(1).optional(),
  requestedTypes: z.array(z.enum(CONTENT_TYPES)).min(1, "Sélectionne au moins un type de contenu"),
  angle: z.enum(VIDEO_ANGLES).optional(),
  duration: z.union([z.literal(30), z.literal(45), z.literal(60)]).optional(),
  positioning: z.array(z.string()).optional(),
  target: z.string().optional(),
  tone: z.string().optional(),
  languageLevel: z.string().optional(),
  length: z.string().optional(),
  commercialGoal: z.string().optional(),
  mainArgument: z.string().optional(),
  cta: z.string().optional(),
});

export type GenerateBatchPayload = z.infer<typeof generateBatchSchema>;
