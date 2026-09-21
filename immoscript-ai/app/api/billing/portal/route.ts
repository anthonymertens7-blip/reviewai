import { NextResponse } from "next/server";
import { withOrgAuth } from "@/lib/with-org-auth";
import { prisma } from "@/lib/prisma";
import { getStripeClient } from "@/lib/billing/stripe";

/** Ouvre le portail client Stripe (moyen de paiement, factures, résiliation) en libre-service —
 * évite de réimplémenter cette gestion, déjà fournie par Stripe. */
export const POST = withOrgAuth(
  async (req, authContext) => {
    const stripe = getStripeClient();
    if (!stripe) {
      return NextResponse.json({ error: "billing_not_configured" }, { status: 501 });
    }

    const org = await prisma.organization.findUniqueOrThrow({ where: { id: authContext.organizationId } });
    if (!org.stripeCustomerId) {
      return NextResponse.json({ error: "no_stripe_customer" }, { status: 400 });
    }

    const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const session = await stripe.billingPortal.sessions.create({
      customer: org.stripeCustomerId,
      return_url: `${origin}/settings`,
    });

    return NextResponse.json({ url: session.url });
  },
  { minRole: "PROMOTEUR" }
);
