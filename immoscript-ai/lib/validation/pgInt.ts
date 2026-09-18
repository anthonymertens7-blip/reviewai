import { z } from "zod";

// Plage d'un INT4 Postgres (colonnes Prisma `Int`). z.number().int() valide qu'un nombre est un
// entier mais ne le borne pas : un entier JS "safe" hors de cette plage (ex: un utilisateur qui
// saisit 99999999999999 dans un champ numérique) passe donc la validation Zod et fait planter la
// requête Prisma en 500 (ConversionError côté driver) au lieu d'échouer proprement en 400 ici.
const PG_INT4_MIN = -2147483648;
const PG_INT4_MAX = 2147483647;

export const pgInt = z.coerce
  .number()
  .int()
  .min(PG_INT4_MIN, "Nombre trop petit")
  .max(PG_INT4_MAX, "Nombre trop grand");
