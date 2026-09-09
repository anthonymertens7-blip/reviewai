import { z } from "zod";

export const createProgramSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  city: z.string().min(1, "La ville est requise"),
  address: z.string().optional(),
  district: z.string().optional(),
  description: z.string().optional(),
  deliveryDate: z.coerce.date().optional(),
  programType: z.string().optional(),
  unitsCount: z.coerce.number().int().positive().optional(),
  environment: z.string().optional(),
  transport: z.string().optional(),
  schools: z.string().optional(),
  shops: z.string().optional(),
  pointsOfInterest: z.string().optional(),
  amenities: z.string().optional(),
  features: z.string().optional(),
  advantages: z.string().optional(),
});

export const updateProgramSchema = createProgramSchema.partial();

export type CreateProgramInput = z.infer<typeof createProgramSchema>;
export type UpdateProgramInput = z.infer<typeof updateProgramSchema>;
