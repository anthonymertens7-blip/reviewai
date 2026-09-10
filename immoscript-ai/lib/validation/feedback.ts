import { z } from "zod";

export const createFeedbackSchema = z.object({
  message: z.string().min(1, "Le message est requis").max(2000),
  page: z.string().max(500).optional(),
});

export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>;
