/**
 * Source unique de vérité pour les plans commerciaux : quota IA mensuel, prix affiché, et nom de
 * la variable d'environnement portant l'ID du Price Stripe correspondant. Organization.plan
 * (Prisma) stocke l'id du plan en base ; tout le reste (quotas, libellés, checkout Stripe) se
 * dérive de cette config plutôt que d'être dupliqué à chaque endroit qui en a besoin.
 *
 * Grille proposée à partir du coût réel mesuré par génération (~0,015 € en moyenne, retries
 * occasionnels inclus, sur le modèle claude-sonnet-5 utilisé par AIService) — à ajuster librement,
 * c'est le seul endroit à modifier.
 */
export type PlanId = "trial" | "starter" | "pro" | "agency";

export interface PlanConfig {
  id: PlanId;
  label: string;
  monthlyQuota: number;
  /** Prix mensuel TTC en centimes d'euro. 0 pour un plan sans facturation (essai gratuit). */
  priceEurCents: number;
  /** Nom de la variable d'env contenant le Price ID Stripe (mode "subscription") pour ce plan. Vide si non facturable. */
  stripePriceEnvVar: string;
}

export const PLANS: Record<PlanId, PlanConfig> = {
  trial: {
    id: "trial",
    label: "Essai gratuit",
    monthlyQuota: 30,
    priceEurCents: 0,
    stripePriceEnvVar: "",
  },
  starter: {
    id: "starter",
    label: "Starter",
    monthlyQuota: 150,
    priceEurCents: 4900,
    stripePriceEnvVar: "STRIPE_PRICE_STARTER",
  },
  pro: {
    id: "pro",
    label: "Pro",
    monthlyQuota: 500,
    priceEurCents: 12900,
    stripePriceEnvVar: "STRIPE_PRICE_PRO",
  },
  agency: {
    id: "agency",
    label: "Agence",
    monthlyQuota: 2000,
    priceEurCents: 34900,
    stripePriceEnvVar: "STRIPE_PRICE_AGENCY",
  },
};

export const DEFAULT_PLAN: PlanId = "trial";
export const PLAN_ORDER: PlanId[] = ["trial", "starter", "pro", "agency"];

export function isPlanId(value: string): value is PlanId {
  return Object.prototype.hasOwnProperty.call(PLANS, value);
}

/** Un plan inconnu (donnée corrompue, futur plan retiré) retombe sur le quota du plan par défaut plutôt que de planter. */
export function quotaForPlan(plan: string): number {
  return isPlanId(plan) ? PLANS[plan].monthlyQuota : PLANS[DEFAULT_PLAN].monthlyQuota;
}

export function planLabel(plan: string): string {
  return isPlanId(plan) ? PLANS[plan].label : plan;
}

export function planForStripePriceId(priceId: string): PlanId | null {
  for (const plan of PLAN_ORDER) {
    const envVar = PLANS[plan].stripePriceEnvVar;
    if (envVar && process.env[envVar] === priceId) {
      return plan;
    }
  }
  return null;
}
