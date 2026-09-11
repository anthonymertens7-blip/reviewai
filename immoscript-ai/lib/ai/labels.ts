import { FileText, Globe, Instagram, Facebook, Linkedin, Music2, Video, type LucideIcon } from "lucide-react";
import type { ContentType, VideoAngle } from "./types";

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  listing_full: "Annonce longue",
  listing_short: "Annonce courte",
  portal: "Portail immobilier",
  website: "Site web",
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
  video_script: "Script vidéo",
};

export const CONTENT_TYPE_ICONS: Record<ContentType, LucideIcon> = {
  listing_full: FileText,
  listing_short: FileText,
  portal: Globe,
  website: Globe,
  instagram: Instagram,
  facebook: Facebook,
  linkedin: Linkedin,
  tiktok: Music2,
  video_script: Video,
};

export const VIDEO_ANGLE_LABELS: Record<VideoAngle, string> = {
  emotion: "Émotion",
  investissement: "Investissement",
  visite: "Visite guidée",
  storytelling: "Storytelling",
  urgence: "Urgence",
};
