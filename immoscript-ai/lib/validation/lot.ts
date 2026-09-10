import { z } from "zod";

export const createLotSchema = z.object({
  reference: z.string().min(1, "La référence est requise"),
  propertyType: z.string().min(1, "Le type de bien est requis"),
  roomsCount: z.coerce.number().int().positive().optional(),
  livingArea: z.coerce.number().positive().optional(),
  outdoorArea: z.coerce.number().positive().optional(),
  floor: z.coerce.number().int().optional(),
  orientation: z.string().optional(),
  exposure: z.string().optional(),
  view: z.string().optional(),
  hasBalcony: z.boolean().optional(),
  hasTerrace: z.boolean().optional(),
  hasGarden: z.boolean().optional(),
  hasParking: z.boolean().optional(),
  hasCellar: z.boolean().optional(),
  price: z.coerce.number().positive().optional(),
  pricePerSqm: z.coerce.number().positive().optional(),
  availability: z.string().optional(),
  specialFeatures: z.string().optional(),
});

export const updateLotSchema = createLotSchema.partial();

export type CreateLotInput = z.infer<typeof createLotSchema>;
export type UpdateLotInput = z.infer<typeof updateLotSchema>;
