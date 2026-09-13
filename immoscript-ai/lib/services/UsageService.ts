import { prisma } from "@/lib/prisma";

// Filet de sécurité minimal contre l'emballement des coûts IA (risque n°1 identifié
// dès le document d'architecture) : un plafond mensuel par organisation, sans
// dépendance à un fournisseur de facturation. `generationsQuota` reste stocké par
// ligne pour permettre plus tard des quotas différenciés par plan.
const DEFAULT_MONTHLY_QUOTA = Number(process.env.MONTHLY_GENERATION_QUOTA ?? 300);

export class QuotaExceededError extends Error {}

function currentPeriod() {
  const now = new Date();
  const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const periodEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { periodStart, periodEnd };
}

export class UsageService {
  /**
   * Vérifie qu'il reste assez de quota IA ce mois-ci pour cette organisation et
   * l'incrémente si oui. Point de passage obligatoire avant tout appel Anthropic
   * facturé (génération, régénération, suggestion de champ). Lève
   * QuotaExceededError sinon — à appeler avant l'appel IA, pas après, pour ne
   * jamais dépasser le plafond même en cas d'usage concurrent.
   */
  static async assertQuotaAndReserve(organizationId: string, amount: number): Promise<{ used: number; quota: number }> {
    const { periodStart, periodEnd } = currentPeriod();

    await prisma.usageCounter.upsert({
      where: { organizationId_periodStart: { organizationId, periodStart } },
      create: { organizationId, periodStart, periodEnd, generationsUsed: 0, generationsQuota: DEFAULT_MONTHLY_QUOTA },
      update: {},
    });

    const counter = await prisma.usageCounter.findUniqueOrThrow({
      where: { organizationId_periodStart: { organizationId, periodStart } },
    });

    if (counter.generationsUsed + amount > counter.generationsQuota) {
      throw new QuotaExceededError(
        `Quota IA mensuel atteint (${counter.generationsUsed}/${counter.generationsQuota}). Il sera réinitialisé le mois prochain.`
      );
    }

    const updated = await prisma.usageCounter.update({
      where: { organizationId_periodStart: { organizationId, periodStart } },
      data: { generationsUsed: { increment: amount } },
    });

    return { used: updated.generationsUsed, quota: updated.generationsQuota };
  }

  static async getUsage(organizationId: string): Promise<{ used: number; quota: number; periodEnd: Date }> {
    const { periodStart, periodEnd } = currentPeriod();
    const counter = await prisma.usageCounter.findUnique({
      where: { organizationId_periodStart: { organizationId, periodStart } },
    });
    return { used: counter?.generationsUsed ?? 0, quota: counter?.generationsQuota ?? DEFAULT_MONTHLY_QUOTA, periodEnd };
  }
}
