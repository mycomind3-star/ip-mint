import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { query } from "@/lib/db";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const { userId, plan } = session.metadata || {};
        if (!userId || !plan) break;

        await query(
          `UPDATE users SET plan = $1, stripe_customer_id = $2 WHERE id = $3`,
          [plan, session.customer, userId]
        );

        // Upsert subscription record
        if (session.subscription) {
          const sub = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          await query(
            `INSERT INTO subscriptions (user_id, stripe_subscription_id, plan, status, current_period_end)
             VALUES ($1, $2, $3, $4, to_timestamp($5))
             ON CONFLICT (stripe_subscription_id) DO UPDATE
             SET status = EXCLUDED.status, current_period_end = EXCLUDED.current_period_end`,
            [userId, sub.id, plan, sub.status, sub.current_period_end]
          );
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const plan = sub.metadata?.plan;
        const userId = sub.metadata?.userId;
        if (!userId) break;

        await query(
          `UPDATE subscriptions SET status = $1, current_period_end = to_timestamp($2) WHERE stripe_subscription_id = $3`,
          [sub.status, sub.current_period_end, sub.id]
        );

        if (plan) {
          await query(`UPDATE users SET plan = $1 WHERE id = $2`, [plan, userId]);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        if (!userId) break;

        await query(
          `UPDATE subscriptions SET status = 'cancelled' WHERE stripe_subscription_id = $1`,
          [sub.id]
        );
        await query(`UPDATE users SET plan = 'free' WHERE id = $1`, [userId]);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
