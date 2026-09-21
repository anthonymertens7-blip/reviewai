import { describe, it, expect } from "vitest";
import { isSubscriptionConfirmed } from "./subscriptionStatus";
import type Stripe from "stripe";

describe("isSubscriptionConfirmed", () => {
  it.each<[Stripe.Subscription.Status, boolean]>([
    ["active", true],
    ["trialing", true],
    ["incomplete", false],
    ["incomplete_expired", false],
    ["past_due", false],
    ["unpaid", false],
    ["canceled", false],
    ["paused", false],
  ])("statut %s -> confirmé = %s", (status, expected) => {
    expect(isSubscriptionConfirmed(status)).toBe(expected);
  });
});
