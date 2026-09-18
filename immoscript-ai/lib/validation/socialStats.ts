import { z } from "zod";
import { pgInt } from "./pgInt";

export const socialStatsSchema = z.object({
  url: z.string().url().max(500).optional().or(z.literal("")),
  likes: pgInt.min(0).optional(),
  views: pgInt.min(0).optional(),
  comments: pgInt.min(0).optional(),
});

export type SocialStatsInput = z.infer<typeof socialStatsSchema>;
