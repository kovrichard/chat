import "server-only";

import { z } from "zod";

const schema = z.object({
  // General
  environment: z.enum(["development", "stage", "production"]).default("development"),
  logLevel: z.enum(["error", "warn", "info", "debug"]).default("info"),
  logDrainUrl: z.string().default(""),
  scheme: z.string().default("https"),
  authority: z.string(),
  host: z.string().url(),

  // Auth
  githubId: z.string().optional(),
  githubSecret: z.string().optional(),
  googleId: z.string().optional(),
  googleSecret: z.string().optional(),

  // Stripe
  stripeSecretKey: z.string().default(""),
  stripeWebhookSecret: z.string().default(""),
  stripePortalReturnUrl: z.string().default("http://localhost:3000/chat"),
  stripeTrialSubscriptionPriceId: z.string().default(""),
});

const envVars = {
  // General
  environment: process.env.ENVIRONMENT,
  logLevel: process.env.LOG_LEVEL,
  logDrainUrl: process.env.LOG_DRAIN_URL,
  scheme: process.env.SCHEME,
  authority: process.env.AUTHORITY,
  host: `${process.env.SCHEME || "https"}://${process.env.AUTHORITY}`,

  // Auth
  githubId: process.env.AUTH_GITHUB_ID,
  githubSecret: process.env.AUTH_GITHUB_SECRET,
  googleId: process.env.AUTH_GOOGLE_ID,
  googleSecret: process.env.AUTH_GOOGLE_SECRET,

  // Stripe
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  stripePortalReturnUrl: process.env.STRIPE_PORTAL_RETURN_URL,
  stripeTrialSubscriptionPriceId: process.env.STRIPE_TRIAL_SUBSCRIPTION_PRICE_ID,
};

const conf = schema.parse(envVars);

export default conf;
