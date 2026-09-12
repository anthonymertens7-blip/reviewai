import type { ContentType } from "@/lib/ai/types";
import type { ListingOutput, SocialOutput, VideoScriptOutput } from "@/lib/ai/schemas";

export interface ExportSection {
  heading?: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface ExportDocument {
  title: string;
  sections: ExportSection[];
}

const SOCIAL_TYPES: ContentType[] = ["instagram", "facebook", "linkedin", "tiktok"];

export function contentToSections(type: ContentType, content: unknown): ExportDocument {
  if (type === "video_script") {
    const script = content as VideoScriptOutput;
    return {
      title: "Script vidéo",
      sections: [
        { paragraphs: [script.hook] },
        ...script.scenes.map((scene) => ({
          heading: `Scène — ${scene.time}s`,
          paragraphs: [
            `Visuel : ${scene.visual}`,
            `Voix off : ${scene.voiceover}`,
            ...(scene.textOverlay ? [`Texte à l'écran : ${scene.textOverlay}`] : []),
          ],
        })),
        { heading: "Appel à l'action", paragraphs: [script.cta] },
      ],
    };
  }

  if (SOCIAL_TYPES.includes(type)) {
    const social = content as SocialOutput;
    return {
      title: "Publication",
      sections: [
        { paragraphs: [social.caption] },
        { heading: "Hashtags", paragraphs: [social.hashtags.map((h) => `#${h}`).join(" ")] },
      ],
    };
  }

  const listing = content as ListingOutput;
  return {
    title: listing.title,
    sections: [
      { paragraphs: [listing.description] },
      { heading: "Points forts", bullets: listing.highlights },
      { heading: "Appel à l'action", paragraphs: [listing.cta] },
    ],
  };
}
