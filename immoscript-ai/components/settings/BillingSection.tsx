"use client";

import { useState } from "react";
import { CreditCard, Check, Loader2 } from "lucide-react";
import { PLANS, PLAN_ORDER, planLabel, formatPlanPrice, type PlanId } from "@/lib/billing/plans";

export interface BillingInfo {
  plan: string;
  hasStripeCustomer: boolean;
  used: number;
  quota: number | null;
  periodEnd: string;
}

const PAYABLE_PLANS = PLAN_ORDER.filter((id) => id !== "trial") as Exclude<PlanId, "trial">[];

export function BillingSection({ billing }: { billing: BillingInfo }) {
  const [loadingPlan, setLoadingPlan] = useState<PlanId | "portal" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function redirectToUrl(res: Response) {
    const data = await res.json();
    if (!res.ok || !data.url) {
      // "billing_not_configured" (501) : STRIPE_SECRET_KEY absent — attendu tant que le compte
      // Stripe réel n'est pas encore branché, voir lib/billing/stripe.ts.
      if (data.error === "billing_not_configured") {
        throw new Error("La facturation en ligne n'est pas encore activée. Contactez-nous pour souscrire.");
      }
      throw new Error("Une erreur est survenue, réessayez dans un instant.");
    }
    window.location.href = data.url;
  }

  async function handleUpgrade(plan: PlanId) {
    setError(null);
    setLoadingPlan(plan);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      await redirectToUrl(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "L'ouverture du paiement a échoué.");
      setLoadingPlan(null);
    }
  }

  async function handleManageSubscription() {
    setError(null);
    setLoadingPlan("portal");
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      await redirectToUrl(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "L'ouverture du portail a échoué.");
      setLoadingPlan(null);
    }
  }

  const usagePercent = billing.quota ? Math.min(100, Math.round((billing.used / billing.quota) * 100)) : 0;
  const periodEndLabel = new Date(billing.periodEnd).toLocaleDateString("fr-FR", { day: "numeric", month: "long" });

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border bg-white p-6 dark:border-gray-700 dark:bg-gray-800 shadow-[0_10px_28px_-10px_rgba(15,23,42,0.16)] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.6)]">
        <div className="mb-4 flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-gray-700">
            <CreditCard className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-semibold">Plan actuel : {planLabel(billing.plan)}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Réinitialisation le {periodEndLabel}</p>
          </div>
        </div>

        {billing.quota !== null && (
          <div>
            <div className="mb-1.5 flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
              <span>Générations ce mois-ci</span>
              <span>
                {billing.used} / {billing.quota}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
              <div
                className={`h-full rounded-full ${usagePercent >= 90 ? "bg-red-500" : "bg-brand-600"}`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </div>
        )}

        {billing.hasStripeCustomer && (
          <button
            type="button"
            onClick={handleManageSubscription}
            disabled={loadingPlan !== null}
            className="mt-4 flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            {loadingPlan === "portal" && <Loader2 className="h-4 w-4 animate-spin" />}
            Gérer mon abonnement
          </button>
        )}

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {PAYABLE_PLANS.map((planId) => {
          const config = PLANS[planId];
          const isCurrent = billing.plan === planId;
          return (
            <div
              key={planId}
              className={`rounded-3xl border p-5 shadow-[0_10px_28px_-10px_rgba(15,23,42,0.16)] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.6)] ${
                isCurrent
                  ? "border-brand-600 bg-brand-50 dark:border-brand-500 dark:bg-gray-800"
                  : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
              }`}
            >
              <h3 className="font-semibold">{config.label}</h3>
              <p className="mt-1 text-2xl font-bold">
                {formatPlanPrice(config.priceEurCents)}
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400"> / mois</span>
              </p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{config.monthlyQuota} générations / mois</p>

              {isCurrent ? (
                <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-brand-600 dark:text-brand-400">
                  <Check className="h-4 w-4" />
                  Plan actuel
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleUpgrade(planId)}
                  disabled={loadingPlan !== null}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  {loadingPlan === planId && <Loader2 className="h-4 w-4 animate-spin" />}
                  Choisir ce plan
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
