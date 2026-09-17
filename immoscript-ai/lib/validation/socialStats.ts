import { z } from "zod";

export const socialStatsSchema = z.object({
  url: z.string().url().max(500).optional().or(z.literal("")),
  likes: z.coerce.number().int().min(0).optional(),
  views: z.coerce.number().int().min(0).optional(),
  comments: z.coerce.number().int().min(0).optional(),
});

export type SocialStatsInput = z.infer<typeof socialStatsSchema>;
