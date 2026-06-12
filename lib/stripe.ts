import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
});

export const PLANS = {
  creator: {
    name: "Creator",
    priceId: process.env.STRIPE_CREATOR_PRICE_ID!,
    price: 9.99,
    mints: 10,
    features: [
      "10 mints/month",
      "Text + file upload (up to 10MB)",
      "Clean PDF certificate",
      "Private verification option",
      "Email confirmation",
    ],
  },
  founder: {
    name: "Founder",
    priceId: process.env.STRIPE_FOUNDER_PRICE_ID!,
    price: 29,
    mints: 50,
    features: [
      "50 mints/month",
      "3 team seats",
      "All file types (up to 50MB)",
      "Priority processing",
      "Bulk export (ZIP)",
      "Custom certificate branding",
    ],
  },
  agency: {
    name: "Agency / API",
    priceId: process.env.STRIPE_AGENCY_PRICE_ID!,
    price: 99,
    mints: 500,
    features: [
      "500 mints/month",
      "Full REST API access",
      "Webhook support",
      "White-label certificates",
      "CSV export",
      "SLA support",
    ],
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export async function createCheckoutSession(
  plan: PlanKey,
  userId: string,
  userEmail: string,
  customerId?: string
): Promise<string> {
  const planData = PLANS[plan];

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId || undefined,
    customer_email: customerId ? undefined : userEmail,
    line_items: [{ price: planData.priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/account?success=true&plan=${plan}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    metadata: { userId, plan },
    subscription_data: { metadata: { userId, plan } },
  });

  return session.url!;
}

export async function createCustomerPortalSession(
  customerId: string
): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/account`,
  });
  return session.url;
}
