import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripeClient } from "@/lib/billing/stripe";
import { planForStripePriceId } from "@/lib/billing/plans";

/**
 * Authentifié par la signature Stripe (STRIPE_WEBHOOK_SECRET), pas par session Clerk — comme
 * /api/cron/*, cette route est explicitement exclue du middleware d'auth (voir middleware.ts).
 * Source de vérité du plan actif d'une organisation : le checkout (POST /api/billing/checkout)
 * ne fait que démarrer un paiement, c'est cet événement qui confirme qu'il a réellement abouti.
 */
export async function POST(req: Request) {
  const stripe = getStripeClient();
  if (!stripe) {
    return NextResponse.json({ error: "billing_not_configured" }, { status: 501 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");
  if (!webhookSecret || !signature) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }

  // La vérification de signature exige le corps brut exact envoyé par Stripe : le parser en JSON
  // avant (ou l'exécution d'un middleware qui le ferait) invaliderait la signature.
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error("[billing/webhook] Signature invalide :", error);
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const priceId = subscription.items.data[0]?.price.id;
      const plan = priceId ? planForStripePriceId(priceId) : null;
      const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

      if (plan) {
        await prisma.organization.updateMany({
          where: { stripeCustomerId: customerId },
          data: { plan, stripeSubscriptionId: subscription.id },
        });
      } else {
        // Price ID reçu de Stripe qui ne correspond à aucune variable STRIPE_PRICE_* configurée :
        // signale une désynchronisation config Stripe / lib/billing/plans.ts plutôt que d'échouer
        // silencieusement en laissant l'organisation sur son ancien plan.
        console.error(`[billing/webhook] Price ID Stripe inconnu, aucun plan ne correspond : ${priceId}`);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

      // Résiliation (via le portail client ou fin d'essai sans moyen de paiement) : retour au plan
      // gratuit plutôt qu'un plan payant fantôme sans abonnement actif derrière.
      await prisma.organization.updateMany({
        where: { stripeCustomerId: customerId },
        data: { plan: "trial", stripeSubscriptionId: null },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
