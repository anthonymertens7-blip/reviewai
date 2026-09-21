import Stripe from "stripe";

let client: Stripe | undefined;

/** Retourne `null` si STRIPE_SECRET_KEY n'est pas configuré, plutôt que de lever une erreur —
 * même principe que getResendClient : la facturation est absente en dev/test tant que la clé
 * n'est pas fournie, sans faire planter le reste de l'app. */
export function getStripeClient(): Stripe | null {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) return null;
  if (!client) {
    client = new Stripe(apiKey);
  }
  return client;
}
