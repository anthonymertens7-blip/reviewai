import { z } from "zod";
import { pgInt } from "./pgInt";

// Les champs optionnels sont aussi .nullable() : sur le formulaire d'édition (contrairement à la
// création, où il n'y a rien à effacer), un champ vidé par l'utilisateur doit explicitement
// mettre la colonne à null plutôt que d'être absent du payload — un champ absent d'un update()
// Prisma ne touche pas la colonne, donc l'ancienne valeur resterait silencieusement affichée.
export const createProgramSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  city: z.string().min(1, "La ville est requise"),
  address: z.string().min(1, "L'adresse est requise"),
  district: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  deliveryDate: z.coerce.date().nullable().optional(),
  programType: z.string().nullable().optional(),
  unitsCount: pgInt.positive().nullable().optional(),
  environment: z.string().nullable().optional(),
  transport: z.string().nullable().optional(),
  schools: z.string().nullable().optional(),
  shops: z.string().nullable().optional(),
  pointsOfInterest: z.string().nullable().optional(),
  amenities: z.string().nullable().optional(),
  features: z.string().nullable().optional(),
  advantages: z.string().nullable().optional(),
  isCoOwnership: z.boolean().optional(),
  condoLotsCount: pgInt.positive().nullable().optional(),
});

// L'adresse est requise à la création mais peut être effacée à l'édition (un programme dupliqué
// démarre justement sans adresse — voir ProgramService.duplicate — en attendant d'être ressaisie),
// d'où la surcharge en plus du .partial() qui gère déjà tous les autres champs.
export const updateProgramSchema = createProgramSchema.partial().extend({
  address: z.string().nullable().optional(),
});

export type CreateProgramInput = z.infer<typeof createProgramSchema>;
export type UpdateProgramInput = z.infer<typeof updateProgramSchema>;
