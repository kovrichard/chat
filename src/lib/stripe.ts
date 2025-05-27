import conf from "@/lib/config";
import type { User } from "@/lib/prisma/client";
import Stripe from "stripe";
import { getUserIdFromSession } from "./dao/users";
import { ensure } from "./utils";

export const stripeConfigured =
  conf.stripeSecretKey !== "" &&
  conf.stripeWebhookSecret !== "" &&
  conf.stripeTrialSubscriptionPriceId !== "";

export let stripe: Stripe | null = null;

if (stripeConfigured) {
  stripe = new Stripe(conf.stripeSecretKey, {
    apiVersion: "2024-09-30.acacia",
  });
}

export async function createStripeCustomer(user: User): Promise<Stripe.Customer> {
  ensure(stripe, "Stripe is not configured");

  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
    metadata: {
      userId: user.id,
      env: conf.environment,
    },
  });
  return customer;
}

export async function createStripeTrialSubscription(userId: number, customerId: string) {
  ensure(stripe, "Stripe is not configured");

  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: conf.stripeTrialSubscriptionPriceId }],
    metadata: {
      userId: userId,
      env: conf.environment,
    },
  });

  return subscription;
}

export async function createStripeBillingPortalUrl(customerId: string) {
  ensure(stripe, "Stripe is not configured");

  await getUserIdFromSession();

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: conf.stripePortalReturnUrl,
  });

  return session.url;
}
