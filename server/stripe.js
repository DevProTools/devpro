// Stripe integration
import Stripe from 'stripe';
import { setProStatus, findUser } from './db.js';

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

const stripe = STRIPE_SECRET ? new Stripe(STRIPE_SECRET) : null;

const PRICE_ID = process.env.STRIPE_PRICE_ID || 'price_pro_monthly';
const DOMAIN = process.env.DOMAIN || 'http://localhost:3000';

export async function createCheckoutSession(userId, email) {
  if (!stripe) {
    // Dev mode: simulate success
    setProStatus(userId, true);
    return { url: `${DOMAIN}/?pro=true` };
  }

  const session = await stripe.checkout.sessions.create({
    customer_email: email,
    mode: 'subscription',
    line_items: [{ price: PRICE_ID, quantity: 1 }],
    success_url: `${DOMAIN}/?pro=true`,
    cancel_url: `${DOMAIN}/?canceled=true`,
    metadata: { userId },
  });

  return { url: session.url };
}

export async function handleWebhook(req, res) {
  if (!stripe || !STRIPE_WEBHOOK_SECRET) {
    res.status(200).json({ received: true });
    return;
  }

  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    return res.status(400).json({ error: `Webhook Error: ${e.message}` });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata?.userId;
    if (userId) {
      setProStatus(userId, true);
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object;
    // Find user by customer email and disable pro
    // Simplified: would need a mapping in production
  }

  res.json({ received: true });
}
