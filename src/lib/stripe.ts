import conf from "@/lib/config";
import Stripe from "stripe";
import { getUserIdFromSession } from "./dao/users";

export const stripe = new Stripe(conf.stripeSecretKey, {
  apiVersion: "2024-09-30.acacia",
});

export async function createStripeBillingPortalUrl(customerId: string) {
  await getUserIdFromSession();

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: conf.stripePortalReturnUrl,
  });

  return session.url;
}
