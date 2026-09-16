import { z } from "zod";
import type { ContentType } from "./types";

// Les descriptions par champ (pas seulement les instructions générales du prompt) sont ce que le
// modèle consulte en priorité lors d'un appel d'outil forcé : en pratique, un champ tableau sans
// description explicite ("obligatoire", "jamais vide") est parfois omis alors que le texte
// principal est bien rédigé.
export const listingOutputSchema = z.object({
  title: z.string().describe("Titre accrocheur de l'annonce. Champ obligatoire."),
  description: z.string().describe("Corps du texte de l'annonce. Champ obligatoire."),
  highlights: z
    .array(z.string())
    .min(1)
    .describe(
      "Liste de 3 à 6 points forts courts (ex: 'Balcon exposé ouest', 'Parking inclus'). " +
        "Champ obligatoire, ne doit jamais être omis ni vide."
    ),
  cta: z.string().describe("Appel à l'action final. Champ obligatoire."),
});

export const socialOutputSchema = z.object({
  caption: z.string().describe("Texte du post. Champ obligatoire."),
  hashtags: z
    .array(z.string())
    .min(1)
    .describe(
      "Liste de hashtags pertinents (sans le caractère '#'). Champ obligatoire, ne doit jamais être omis ni vide."
    ),
});

export const videoScriptOutputSchema = z.object({
  angle: z.string().describe("Angle narratif du script. Champ obligatoire."),
  duration: z.number().describe("Durée totale en secondes. Champ obligatoire."),
  hook: z.string().describe("Phrase d'accroche des 3 premières secondes. Champ obligatoire."),
  scenes: z
    .array(
      z.object({
        time: z.string(),
        visual: z.string(),
        voiceover: z.string(),
        textOverlay: z.string(),
      })
    )
    .min(1)
    .describe("Liste ordonnée des scènes du script. Champ obligatoire, ne doit jamais être omis ni vide."),
  cta: z.string().describe("Appel à l'action final. Champ obligatoire."),
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
