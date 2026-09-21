import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { UsageService, QuotaExceededError, currentPeriod } from "./UsageService";
import { createTestOrg, cleanupTestOrg } from "../../test/testOrg";

/**
 * Couvre l'invariant le plus critique de la facturation à l'usage : sous accès concurrent, le
 * quota mensuel ne doit jamais être dépassé (voir le commentaire de assertQuotaAndReserve sur
 * pourquoi un read-check-write en JS serait une vraie course). Contre une vraie base Postgres,
 * pas un mock — c'est précisément le comportement de verrouillage de ligne de Postgres qui est
 * sous test ici.
 */
describe("UsageService.assertQuotaAndReserve", () => {
  let organizationId: string;

  beforeEach(async () => {
    const org = await createTestOrg(`usage_${Date.now()}_${Math.random().toString(36).slice(2)}`);
    organizationId = org.organizationId;
  });

  afterEach(async () => {
    await cleanupTestOrg(organizationId);
  });

  it("ne dépasse jamais le quota sous 20 réservations concurrentes pour un quota de 5", async () => {
    const { periodStart, periodEnd } = currentPeriod();
    await prisma.usageCounter.create({
      data: { organizationId, periodStart, periodEnd, generationsUsed: 0, generationsQuota: 5 },
    });

    const results = await Promise.allSettled(
      Array.from({ length: 20 }, () => UsageService.assertQuotaAndReserve(organizationId, 1))
    );

    const succeeded = results.filter((r) => r.status === "fulfilled");
    const failed = results.filter((r) => r.status === "rejected");

    expect(succeeded).toHaveLength(5);
    expect(failed).toHaveLength(15);
    for (const r of failed) {
      expect((r as PromiseRejectedResult).reason).toBeInstanceOf(QuotaExceededError);
    }

    const counter = await prisma.usageCounter.findUniqueOrThrow({
      where: { organizationId_periodStart: { organizationId, periodStart } },
    });
    expect(counter.generationsUsed).toBe(5);
  });

  it("rend le quota réservé via release()", async () => {
    const { periodStart, periodEnd } = currentPeriod();
    await prisma.usageCounter.create({
      data: { organizationId, periodStart, periodEnd, generationsUsed: 3, generationsQuota: 5 },
    });

    await UsageService.release(organizationId, 2);

    const counter = await prisma.usageCounter.findUniqueOrThrow({
      where: { organizationId_periodStart: { organizationId, periodStart } },
    });
    expect(counter.generationsUsed).toBe(1);
  });
});
