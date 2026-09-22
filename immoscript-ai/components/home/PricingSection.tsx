import { Check } from "lucide-react";
import { PLANS, PLAN_ORDER, formatPlanPrice } from "@/lib/billing/plans";

export function PricingSection() {
  return (
    <div className="w-full">
      <div className="grid w-full gap-6 sm:grid-cols-4">
        {PLAN_ORDER.map((planId) => {
          const config = PLANS[planId];
          return (
            <div
              key={planId}
              className="rounded-3xl border border-gray-200 bg-white p-5 shadow-[0_10px_28px_-10px_rgba(15,23,42,0.16)] dark:border-gray-700 dark:bg-gray-800 dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.6)]"
            >
              <h3 className="font-semibold">{config.label}</h3>
              <p className="mt-1 text-2xl font-bold">
                {config.priceEurCents === 0 ? "0 €" : formatPlanPrice(config.priceEurCents)}
                {config.priceEurCents > 0 && (
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400"> / mois</span>
                )}
              </p>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                <Check className="h-4 w-4 shrink-0 text-brand-600" />
                {config.monthlyQuota} générations / mois
              </p>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
        Sans carte bancaire pour l&apos;essai gratuit. Changez ou annulez votre plan à tout moment.
      </p>
    </div>
  );
}
