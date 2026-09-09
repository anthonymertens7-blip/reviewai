export const CONTENT_TYPES = [
  "listing_full",
  "listing_short",
  "portal",
  "website",
  "instagram",
  "facebook",
  "linkedin",
  "tiktok",
  "video_script",
] as const;

export type ContentType = (typeof CONTENT_TYPES)[number];

export const VIDEO_ANGLES = ["emotion", "investissement", "visite", "storytelling", "urgence"] as const;
export type VideoAngle = (typeof VIDEO_ANGLES)[number];

export const VIDEO_DURATIONS = [30, 45, 60] as const;
export type VideoDuration = (typeof VIDEO_DURATIONS)[number];

// Uniquement les champs métier — les null/undefined sont filtrés avant l'appel IA.
export interface ProgramData {
  name: string;
  address?: string | null;
  city: string;
  district?: string | null;
  description?: string | null;
  deliveryDate?: string | Date | null;
  programType?: string | null;
  unitsCount?: number | null;
  environment?: string | null;
  transport?: string | null;
  schools?: string | null;
  shops?: string | null;
  pointsOfInterest?: string | null;
  amenities?: string | null;
  features?: string | null;
  advantages?: string | null;
}

export interface LotData {
  reference: string;
  propertyType: string;
  roomsCount?: number | null;
  livingArea?: number | null;
  outdoorArea?: number | null;
  floor?: number | null;
  orientation?: string | null;
  exposure?: string | null;
  view?: string | null;
  hasBalcony?: boolean;
  hasTerrace?: boolean;
  hasGarden?: boolean;
  hasParking?: boolean;
  hasCellar?: boolean;
  price?: number | null;
  pricePerSqm?: number | null;
  availability?: string | null;
  specialFeatures?: string | null;
}

export interface MarketingParams {
  positioning?: string[];
  target?: string | null;
  tone?: string | null;
  languageLevel?: string | null;
  length?: string | null;
  commercialGoal?: string | null;
  mainArgument?: string | null;
  cta?: string | null;
}

export interface GenerateContentInput {
  type: ContentType;
  angle?: VideoAngle;
  duration?: VideoDuration;
  program: ProgramData;
  lot?: LotData;
  marketing: MarketingParams;
  promptVersion?: number;
}
