import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getScopedPrismaClient } from "@/lib/db/scoped-client";
import type { AuthContext } from "@/lib/auth";

/** Organisation/utilisateur jetables pour les tests d'intégration (vraie base Postgres, voir
 * vitest.config.ts) — un id unique par test pour pouvoir tourner en parallèle sans collision. */
export async function createTestOrg(idSuffix: string) {
  const organizationId = `test_org_${idSuffix}`;
  const userId = `test_user_${idSuffix}`;

  await prisma.organization.create({ data: { id: organizationId, name: "Organisation de test", plan: "trial" } });
  await prisma.user.create({
    data: { id: userId, organizationId, role: Role.ADMIN, email: `${idSuffix}@test.dev` },
  });

  const authContext: AuthContext = {
    userId,
    organizationId,
    role: Role.ADMIN,
    db: getScopedPrismaClient(organizationId),
  };

  return { organizationId, userId, authContext };
}

export async function cleanupTestOrg(organizationId: string) {
  await prisma.usageCounter.deleteMany({ where: { organizationId } });
  await prisma.generatedContent.deleteMany({ where: { program: { organizationId } } });
  await prisma.generationRequest.deleteMany({ where: { organizationId } });
  await prisma.lot.deleteMany({ where: { program: { organizationId } } });
  await prisma.program.deleteMany({ where: { organizationId } });
  await prisma.user.deleteMany({ where: { organizationId } });
  await prisma.organization.delete({ where: { id: organizationId } });
}
