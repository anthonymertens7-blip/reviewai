import { describe, it, expect, afterEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { OnboardingService } from "./OnboardingService";
import { createTestOrg, cleanupTestOrg } from "../../test/testOrg";

describe("OnboardingService.seedDemoProgram", () => {
  let organizationId: string;

  afterEach(async () => {
    await cleanupTestOrg(organizationId);
  });

  it("crée un programme, un lot et un contenu prêts à explorer", async () => {
    const org = await createTestOrg(`onboarding_${Date.now()}_${Math.random().toString(36).slice(2)}`);
    organizationId = org.organizationId;

    await OnboardingService.seedDemoProgram(organizationId, org.userId);

    const programs = await prisma.program.findMany({
      where: { organizationId },
      include: { lots: true, contents: true },
    });

    expect(programs).toHaveLength(1);
    expect(programs[0]!.lots).toHaveLength(1);
    expect(programs[0]!.contents).toHaveLength(1);
    expect(programs[0]!.contents[0]!.approvalStatus).toBe("approved");
  });
});
