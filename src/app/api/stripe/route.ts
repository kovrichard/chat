import conf from "@/lib/config";
import { setFreeMessages, updateSubscription } from "@/lib/dao/users";
import { logger } from "@/lib/logger";
import { stripe } from "@/lib/stripe";
import { ensure } from "@/lib/utils";
import type Stripe from "stripe";

export async function POST(req: Request) {
  try {
    ensure(stripe, "Stripe is not configured");
  } catch (err: any) {
    logger.error(err);
    return new Response("Not implemented", { status: 501 });
  }

  const sig = req.headers.get("stripe-signature") || "";
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      await req.text(),
      sig,
      conf.stripeWebhookSecret
    );
  } catch (err: any) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  switch (event.type) {
    // Handle various event types
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      logger.info(`Subscription updated: ${subscription.id}`);

      await updateSubscription(
        parseInt(subscription.metadata.userId),
        subscription.items.data[0].price.lookup_key || "free"
      );
      break;
    }
    case "invoice.payment_succeeded": {
      const invoice = event.data.object as any;
      logger.info(`Invoice payment succeeded: ${invoice.id}`);

      const subscription = await stripe.subscriptions.retrieve(
        invoice.parent.subscription_details.subscription
      );

      if (subscription.items.data[0].price.lookup_key === "pro") {
        await setFreeMessages(parseInt(subscription.metadata.userId), 2000);
      }

      break;
    }
    default: {
      logger.info(`Unhandled event type: ${event.type}`);
    }
  }

  return new Response("Webhook received", { status: 200 });
}
