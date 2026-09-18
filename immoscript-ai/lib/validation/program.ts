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
  // Bornée à une plage de calendrier normale (millésime à 4 chiffres) : au-delà, la notation ISO
  // 8601 étendue ("+099999-01-01...") que produit new Date() pour une année à 5+ chiffres n'est pas
  // convertible par le moteur de requête Prisma (PrismaClientUnknownRequestError non rattrapée,
  // 500 au lieu d'une erreur de validation propre) — et une date de livraison en l'an 99999 n'a de
  // toute façon aucun sens métier.
  deliveryDate: z.coerce
    .date()
    .min(new Date("1900-01-01"), "Date de livraison trop ancienne")
    .max(new Date("2200-12-31"), "Date de livraison trop lointaine")
    .nullable()
    .optional(),
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
