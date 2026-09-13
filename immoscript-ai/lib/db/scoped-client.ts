import { prisma } from "@/lib/prisma";

/**
 * Point d'accès unique aux données métier : toute lecture/écriture passe par
 * un client Prisma étendu qui injecte automatiquement `organizationId`.
 * Aucun code applicatif ne doit importer `lib/prisma.ts` directement pour
 * des requêtes métier — c'est ce qui garantit l'étanchéité multi-tenant
 * même si un développeur oublie un filtre.
 */

// Modèles portant directement un scalaire organizationId.
const DIRECT_ORG_FIELD_MODELS = new Set(["Program", "GenerationRequest", "UsageCounter", "User", "Feedback", "BrandVoicePreset"]);

// Modèles scopés via leur programme parent (pas de organizationId direct).
const PROGRAM_RELATION_MODELS = new Set(["Lot", "GeneratedContent", "ProgramAccess"]);

// Modèles scopés via le lot (lui-même scopé via son programme) — deux niveaux de relation.
const LOT_RELATION_MODELS = new Set(["LotPhoto"]);

const READ_AND_BULK_WRITE_OPS = new Set([
  "findUnique",
  "findUniqueOrThrow",
  "findFirst",
  "findFirstOrThrow",
  "findMany",
  "count",
  "aggregate",
  "groupBy",
  "update",
  "updateMany",
  "delete",
  "deleteMany",
]);

export function getScopedPrismaClient(organizationId: string) {
  if (!organizationId) {
    throw new Error("getScopedPrismaClient requires a non-empty organizationId");
  }

  return prisma.$extends({
    name: "tenant-scope",
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          if (model && DIRECT_ORG_FIELD_MODELS.has(model)) {
            if (READ_AND_BULK_WRITE_OPS.has(operation)) {
              (args as { where?: Record<string, unknown> }).where = {
                ...((args as { where?: Record<string, unknown> }).where ?? {}),
                organizationId,
              };
            } else if (operation === "create") {
              (args as { data?: Record<string, unknown> }).data = {
                ...((args as { data?: Record<string, unknown> }).data ?? {}),
                organizationId,
              };
            } else if (operation === "createMany") {
              const data = (args as { data?: Record<string, unknown>[] }).data;
              if (Array.isArray(data)) {
                (args as { data: Record<string, unknown>[] }).data = data.map((item) => ({
                  ...item,
                  organizationId,
                }));
              }
            }
          }

          if (model && PROGRAM_RELATION_MODELS.has(model) && READ_AND_BULK_WRITE_OPS.has(operation)) {
            const where = (args as { where?: Record<string, unknown> }).where ?? {};
            (args as { where?: Record<string, unknown> }).where = {
              ...where,
              program: {
                ...((where.program as Record<string, unknown>) ?? {}),
                organizationId,
              },
            };
          }

          if (model && LOT_RELATION_MODELS.has(model) && READ_AND_BULK_WRITE_OPS.has(operation)) {
            const where = (args as { where?: Record<string, unknown> }).where ?? {};
            (args as { where?: Record<string, unknown> }).where = {
              ...where,
              lot: {
                ...((where.lot as Record<string, unknown>) ?? {}),
                program: { organizationId },
              },
            };
          }
          // NB: pour les create/createMany de ces modèles, la vérification que le
          // programId/lotId cible appartient bien à l'organisation reste à la charge du
          // service appelant (ex: ProgramService.assertOwnedByOrg) avant l'écriture,
          // car l'injection générique ne peut pas fiabiliser une écriture imbriquée.

          return query(args);
        },
      },
    },
  });
}

export type ScopedPrismaClient = ReturnType<typeof getScopedPrismaClient>;
