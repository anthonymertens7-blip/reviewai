import { prisma } from "@/lib/prisma";
import { isOwner } from "@/lib/auth";
import { quotaForPlan } from "@/lib/billing/plans";

// Filet de sécurité minimal contre l'emballement des coûts IA (risque n°1 identifié
// dès le document d'architecture) : un plafond mensuel par organisation. `generationsQuota`
// reste stocké par ligne (pas recalculé à chaque lecture) : un changement de plan en cours de mois
// ne modifie pas rétroactivement le quota déjà consommé sur la période en cours, seul le mois
// suivant applique le nouveau plan — voir lib/billing/plans.ts pour la grille par plan.
// Le propriétaire de l'app (OWNER_EMAIL) n'est jamais limité, quelle que soit
// l'organisation active — c'est son propre usage de test/démo, pas celui d'un client.
export class QuotaExceededError extends Error {}

function currentPeriod() {
  const now = new Date();
  const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const periodEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { periodStart, periodEnd };
}

async function getOrganizationPlan(organizationId: string): Promise<string> {
  const org = await prisma.organization.findUnique({ where: { id: organizationId }, select: { plan: true } });
  return org?.plan ?? "trial";
}

export class UsageService {
  /**
   * Vérifie qu'il reste assez de quota IA ce mois-ci pour cette organisation et
   * l'incrémente si oui. Point de passage obligatoire avant tout appel Anthropic
   * facturé (génération, régénération, suggestion de champ). Lève
   * QuotaExceededError sinon — à appeler avant l'appel IA, pas après, pour ne
   * jamais dépasser le plafond même en cas d'usage concurrent.
   */
  static async assertQuotaAndReserve(organizationId: string, amount: number): Promise<{ used: number; quota: number } | null> {
    if (await isOwner()) {
      return null;
    }

    const { periodStart, periodEnd } = currentPeriod();
    const plan = await getOrganizationPlan(organizationId);

    const counter = await prisma.usageCounter.upsert({
      where: { organizationId_periodStart: { organizationId, periodStart } },
      create: { organizationId, periodStart, periodEnd, generationsUsed: 0, generationsQuota: quotaForPlan(plan) },
      update: {},
    });

    // Réservation atomique : la vérification et l'incrément doivent être UNE opération
    // conditionnelle en base plutôt qu'un read-check-write en JS. Ce dernier est une vraie course
    // sous usage concurrent (ex: "générer pour tous les lots" lance un appel IA par lot en
    // parallèle) — deux requêtes lisant toutes les deux "299/300 utilisées" passeraient alors
    // toutes les deux la vérification et dépasseraient le plafond. `updateMany` avec une clause
    // WHERE sur generationsUsed est ré-évaluée par Postgres au moment où le verrou de ligne est
    // acquis (READ COMMITTED), donc une seule des requêtes concurrentes peut réussir.
    const reserved = await prisma.usageCounter.updateMany({
      where: { organizationId, periodStart, generationsUsed: { lte: counter.generationsQuota - amount } },
      data: { generationsUsed: { increment: amount } },
    });

    const latest = await prisma.usageCounter.findUniqueOrThrow({
      where: { organizationId_periodStart: { organizationId, periodStart } },
    });

    if (reserved.count === 0) {
      throw new QuotaExceededError(
        `Quota IA mensuel atteint (${latest.generationsUsed}/${latest.generationsQuota}). Il sera réinitialisé le mois prochain.`
      );
    }

    return { used: latest.generationsUsed, quota: latest.generationsQuota };
  }

  /**
   * Rend au quota du mois les unités réservées par assertQuotaAndReserve pour des générations qui
   * ont finalement échoué côté IA (clé invalide, timeout, réponse invalide...) — sans ça, un appel
   * IA qui échoue consomme quand même le quota de l'organisation alors qu'aucun token n'a servi à
   * produire un contenu utilisable.
   */
  static async release(organizationId: string, amount: number): Promise<void> {
    if (amount <= 0 || (await isOwner())) return;

    const { periodStart } = currentPeriod();
    await prisma.usageCounter.updateMany({
      where: { organizationId, periodStart, generationsUsed: { gte: amount } },
      data: { generationsUsed: { decrement: amount } },
    });
  }

  static async getUsage(organizationId: string): Promise<{ used: number; quota: number | null; periodEnd: Date }> {
    const { periodStart, periodEnd } = currentPeriod();

    if (await isOwner()) {
      return { used: 0, quota: null, periodEnd };
    }

    const counter = await prisma.usageCounter.findUnique({
      where: { organizationId_periodStart: { organizationId, periodStart } },
    });
    if (counter) {
      return { used: counter.generationsUsed, quota: counter.generationsQuota, periodEnd };
    }
    // Aucune génération ce mois-ci pour cette organisation : pas encore de UsageCounter créé
    // (assertQuotaAndReserve ne le crée qu'à la première génération), donc le quota du plan actuel
    // n'a jamais été figé en base — on le lit à la volée plutôt que d'afficher un quota par défaut
    // qui ignorerait le plan réel de l'organisation.
    const plan = await getOrganizationPlan(organizationId);
    return { used: 0, quota: quotaForPlan(plan), periodEnd };
  }
}
