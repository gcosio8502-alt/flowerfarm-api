// Add CORS headers
res.setHeader('Access-Control-Allow-Origin', 'https://flower-farm-landing-3zygd12.public.builtwithrocker.new');
res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

// Handle preflight requests
if (req.method === 'OPTIONS') {
  res.status(200).end();
  return;
}

import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const ALLOWED_ORIGINS = new Set([
  "https://flowerfar8135.builtwithrocket.new",                         // si lo usas
  "https://www.rocket.new",
  "https://rocket.new",
  "https://flower-farm-landing-3zryd12.public.builtwithrocket.new",
  "http://localhost:3000",
]);

export default async function handler(req, res) {
  const origin = req.headers.origin || req.headers.get?.("origin") || "";

  // Si el origin NO está permitido, no devolvemos CORS para que el navegador lo bloquee
  if (!origin || !ALLOWED_ORIGINS.has(origin)) {
    res.setHeader("Vary", "Origin");
    if (req.method === "OPTIONS") return res.status(204).end();
    return res.status(403).json({ error: "Origin not allowed", origin });
  }

  // CORS para orígenes válidos
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Vary", "Origin");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const { amount, currency = "usd", metadata = {} } = body;

    if (!amount || Number.isNaN(Number(amount))) {
      return res.status(400).json({ error: "Missing or invalid `amount` (cents)" });
    }

    const pi = await stripe.paymentIntents.create({
      amount: Math.round(Number(amount)),
      currency,
      automatic_payment_methods: { enabled: true },
      metadata,
    });

    return res.status(200).json({ clientSecret: pi.client_secret });
  } catch (err) {
    console.error("create-payment-intent error:", err);
    return res.status(500).json({ error: "Server error creating PaymentIntent", message: err.message });
  }
}
