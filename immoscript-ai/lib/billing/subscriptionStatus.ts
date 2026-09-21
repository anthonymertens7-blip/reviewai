import type Stripe from "stripe";

/**
 * Un abonnement Stripe existe dès sa création, mais son paiement n'est confirmé que pour ces deux
 * statuts — un moyen de paiement à encaissement différé (prélèvement SEPA, courant en B2B France)
 * laisse l'abonnement "incomplete" plusieurs jours ouvrés avant confirmation. Le webhook
 * (app/api/billing/webhook/route.ts) n'accorde le plan payant que si ce garde-fou est vrai, pour ne
 * jamais accorder de quota avant tout encaissement réel.
 */
export function isSubscriptionConfirmed(status: Stripe.Subscription.Status): boolean {
  return status === "active" || status === "trialing";
}
