// api/create-payment-intent.js
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ⚠️ Usa EXACTAMENTE tu dominio público (sin slash final)
const PUBLIC_ORIGIN = "https://flower-farm-landing-3zryd12.public.builtwithrocket.new";

export default async function handler(req, res) {
  // CORS SIEMPRE
  res.setHeader("Access-Control-Allow-Origin", PUBLIC_ORIGIN);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400"); // cache preflight

  // Preflight
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { amount, currency = "usd", metadata = {} } = req.body || {};
    if (!amount || Number.isNaN(Number(amount))) {
      return res.status(400).json({ error: "Missing or invalid `amount` (cents)" });
    }

    const pi = await stripe.paymentIntents.create({
      amount: Math.round(Number(amount)),
      currency,
      automatic_payment_methods: { enabled: true },
      metadata
    });

    return res.status(200).json({ clientSecret: pi.client_secret });
  } catch (err) {
    console.error("Stripe error:", err);
    return res.status(500).json({ error: "Server error creating PaymentIntent" });
  }
}
