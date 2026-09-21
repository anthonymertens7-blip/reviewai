import { describe, it, expect, afterEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { ensureOnboardingSeed } from "./auth";
import { createTestOrg, cleanupTestOrg } from "../test/testOrg";

/**
 * Couvre le garde-fou du programme de démonstration : ne doit jamais se recréer une fois le flag
 * Organization.onboardingSeeded posé, y compris si l'utilisateur a supprimé le programme
 * d'exemple entre-temps — un programme qui "réapparaît tout seul" serait déroutant, pas utile.
 */
describe("ensureOnboardingSeed", () => {
  let organizationId: string;

  afterEach(async () => {
    await cleanupTestOrg(organizationId);
  });

  it("ne seed qu'une fois, même appelé plusieurs fois avec le flag à jour à chaque appel", async () => {
    const org = await createTestOrg(`ensureSeed_${Date.now()}_${Math.random().toString(36).slice(2)}`);
    organizationId = org.organizationId;

    // Premier appel : organisation neuve, jamais seedée -> doit créer le programme et poser le flag.
    await ensureOnboardingSeed(organizationId, org.userId, false);
    let orgRow = await prisma.organization.findUniqueOrThrow({ where: { id: organizationId } });
    expect(orgRow.onboardingSeeded).toBe(true);
    expect(await prisma.program.count({ where: { organizationId } })).toBe(1);

    // L'utilisateur supprime le programme d'exemple, comme n'importe quel autre programme.
    await prisma.generatedContent.deleteMany({ where: { program: { organizationId } } });
    await prisma.generationRequest.deleteMany({ where: { organizationId } });
    await prisma.lot.deleteMany({ where: { program: { organizationId } } });
    await prisma.program.deleteMany({ where: { organizationId } });

    // Deuxième appel (requête suivante de cet utilisateur) : le flag lu est maintenant true, donc
    // ensureOnboardingSeed ne doit RIEN recréer.
    orgRow = await prisma.organization.findUniqueOrThrow({ where: { id: organizationId } });
    await ensureOnboardingSeed(organizationId, org.userId, orgRow.onboardingSeeded);

    expect(await prisma.program.count({ where: { organizationId } })).toBe(0);
  });
});
