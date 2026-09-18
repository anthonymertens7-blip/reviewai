import { z } from "zod";

// Les champs optionnels sont aussi .nullable() : sur le formulaire d'édition (contrairement à la
// création, où il n'y a rien à effacer), un champ vidé par l'utilisateur doit explicitement
// mettre la colonne à null plutôt que d'être absent du payload — un champ absent d'un update()
// Prisma ne touche pas la colonne, donc l'ancienne valeur resterait silencieusement affichée.
export const createLotSchema = z.object({
  reference: z.string().min(1, "La référence est requise"),
  propertyType: z.string().min(1, "Le type de bien est requis"),
  roomsCount: z.coerce.number().int().nonnegative().nullable().optional(),
  livingArea: z.coerce.number().nonnegative().nullable().optional(),
  outdoorArea: z.coerce.number().nonnegative().nullable().optional(),
  floor: z.coerce.number().int().nullable().optional(),
  orientation: z.string().nullable().optional(),
  exposure: z.string().nullable().optional(),
  view: z.string().nullable().optional(),
  hasBalcony: z.boolean().optional(),
  hasTerrace: z.boolean().optional(),
  hasGarden: z.boolean().optional(),
  hasParking: z.boolean().optional(),
  hasCellar: z.boolean().optional(),
  hasEquippedKitchen: z.boolean().optional(),
  isFurnished: z.boolean().optional(),
  furnishedEquipment: z.array(z.string()).optional(),
  dpeEnergyClass: z.string().nullable().optional(),
  dpeGesClass: z.string().nullable().optional(),
  condoAnnualCharges: z.coerce.number().nonnegative().nullable().optional(),
  price: z.coerce.number().nonnegative().nullable().optional(),
  pricePerSqm: z.coerce.number().nonnegative().nullable().optional(),
  availability: z.string().nullable().optional(),
  specialFeatures: z.string().nullable().optional(),
});

export const updateLotSchema = createLotSchema.partial();

export type CreateLotInput = z.infer<typeof createLotSchema>;
export type UpdateLotInput = z.infer<typeof updateLotSchema>;
