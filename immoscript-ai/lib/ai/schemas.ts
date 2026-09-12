import { z } from "zod";
import type { ContentType } from "./types";

export const listingOutputSchema = z.object({
  title: z.string(),
  description: z.string(),
  highlights: z.array(z.string()),
  cta: z.string(),
});

export const socialOutputSchema = z.object({
  caption: z.string(),
  hashtags: z.array(z.string()),
});

export const videoScriptOutputSchema = z.object({
  angle: z.string(),
  duration: z.number(),
  hook: z.string(),
  scenes: z.array(
    z.object({
      time: z.string(),
      visual: z.string(),
      voiceover: z.string(),
      textOverlay: z.string(),
    })
  ),
  cta: z.string(),
});

const LISTING_TYPES: ContentType[] = ["listing_full", "listing_short", "portal", "website"];
const SOCIAL_TYPES: ContentType[] = ["instagram", "facebook", "linkedin", "tiktok"];

export function schemaForType(type: ContentType) {
  if (LISTING_TYPES.includes(type)) return listingOutputSchema;
  if (SOCIAL_TYPES.includes(type)) return socialOutputSchema;
  if (type === "video_script") return videoScriptOutputSchema;
  throw new Error(`Type de contenu inconnu : ${type}`);
}

export const fieldSuggestionSchema = z.object({
  suggestions: z.array(z.string()).min(1).max(6),
});

export type ListingOutput = z.infer<typeof listingOutputSchema>;
export type SocialOutput = z.infer<typeof socialOutputSchema>;
export type VideoScriptOutput = z.infer<typeof videoScriptOutputSchema>;
export type FieldSuggestionOutput = z.infer<typeof fieldSuggestionSchema>;
