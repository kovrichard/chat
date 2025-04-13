import conf from "@/lib/config";
import { User } from "@prisma/client";
import Stripe from "stripe";
import { getUserIdFromSession } from "./dao/users";

export const stripe = new Stripe(conf.stripeSecretKey, {
  apiVersion: "2024-09-30.acacia",
});

export async function createStripeCustomer(user: User): Promise<Stripe.Customer> {
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
  await getUserIdFromSession();

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: conf.stripePortalReturnUrl,
  });

  return session.url;
}
