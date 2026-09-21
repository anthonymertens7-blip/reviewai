import { NextResponse } from "next/server";
import { z } from "zod";
import { withOrgAuth } from "@/lib/with-org-auth";
import { prisma } from "@/lib/prisma";
import { getStripeClient } from "@/lib/billing/stripe";
import { PLANS, type PlanId } from "@/lib/billing/plans";

// Seuls les plans payants ont un Price Stripe — "trial" n'a rien à checkout (c'est déjà le défaut
// d'une nouvelle organisation, voir Organization.plan @default("trial")).
const PAYABLE_PLANS = ["starter", "pro", "agency"] as const satisfies readonly PlanId[];

const checkoutSchema = z.object({ plan: z.enum(PAYABLE_PLANS) });

export const POST = withOrgAuth(
  async (req, authContext) => {
    const stripe = getStripeClient();
    if (!stripe) {
      return NextResponse.json({ error: "billing_not_configured" }, { status: 501 });
    }

    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_payload", details: parsed.error.flatten() }, { status: 400 });
    }

    const planConfig = PLANS[parsed.data.plan];
    const priceId = process.env[planConfig.stripePriceEnvVar];
    if (!priceId) {
      return NextResponse.json({ error: "plan_not_configured" }, { status: 501 });
    }

    // Organization n'est pas un modèle scopé par le client Prisma étendu (lib/db/scoped-client.ts —
    // il scope les entités qui APPARTIENNENT à une organisation, pas l'organisation elle-même) :
    // le filtre `where: { id: authContext.organizationId }` ci-dessous est ce qui garantit qu'on
    // ne lit/modifie jamais que SA PROPRE organisation, comme le fait déjà UsageService.
    const org = await prisma.organization.findUniqueOrThrow({ where: { id: authContext.organizationId } });

    // Un client Stripe est créé une seule fois par organisation et réutilisé pour tout futur
    // changement de plan — sans ça, chaque checkout créerait un nouveau client Stripe, éclatant
    // l'historique de facturation d'une même organisation entre plusieurs clients Stripe distincts.
    let stripeCustomerId = org.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        name: org.name,
        metadata: { organizationId: org.id },
      });
      stripeCustomerId = customer.id;
      await prisma.organization.update({ where: { id: org.id }, data: { stripeCustomerId } });
    }

    const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    // Organisation déjà abonnée (changement de plan, pas première souscription) : repasser par
    // Stripe Checkout créerait un SECOND abonnement Stripe actif sur le même client, double-facturé,
    // plutôt que de changer le plan de l'abonnement existant — Checkout n'a pas de notion
    // "remplacer mon abonnement en cours", c'est toujours une nouvelle souscription. Un moyen de
    // paiement est déjà enregistré, donc pas besoin de repasser par Checkout : on modifie
    // directement l'abonnement (avec proration), ce qui déclenche customer.subscription.updated —
    // le webhook reste la seule source de vérité qui écrit Organization.plan.
    if (org.stripeSubscriptionId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(org.stripeSubscriptionId);
        const itemId = subscription.items.data[0]?.id;
        if (itemId && subscription.status !== "canceled") {
          await stripe.subscriptions.update(org.stripeSubscriptionId, {
            items: [{ id: itemId, price: priceId }],
            proration_behavior: "create_prorations",
          });
          return NextResponse.json({ url: `${origin}/settings?checkout=success` });
        }
      } catch {
        // L'abonnement stocké en base peut être périmé (ex: résilié via le portail client juste
        // avant ce clic — le webhook customer.subscription.deleted qui aurait remis
        // stripeSubscriptionId à null n'a pas encore été livré/traité). Plutôt que de laisser
        // stripe.subscriptions.retrieve/update échouer en 500 opaque, on retombe sur la création
        // d'un nouvel abonnement ci-dessous, comme pour une toute première souscription.
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      client_reference_id: org.id,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/settings?checkout=success`,
      cancel_url: `${origin}/settings?checkout=cancelled`,
      metadata: { organizationId: org.id, plan: parsed.data.plan },
    });

    if (!session.url) {
      return NextResponse.json({ error: "checkout_session_failed" }, { status: 502 });
    }

    return NextResponse.json({ url: session.url });
  },
  { minRole: "PROMOTEUR" }
);
