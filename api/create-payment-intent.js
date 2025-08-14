// /api/create-payment-intent.js
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Orígenes permitidos: pon aquí los dominios que harán la llamada
const ALLOWED_ORIGINS = new Set([
  "https://flowerfar8135.builtwithrocket.new", // tu web en Rocket
  "http://localhost:3000",                      // opcional para pruebas locales
]);

export default async function handler(req, res) {
  const origin = req.headers.origin || "";
  const allowOrigin = ALLOWED_ORIGINS.has(origin) ? origin : "*";

  // Encabezados CORS (siempre)
  res.setHeader("Access-Control-Allow-Origin", allowOrigin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
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
      metadata,
    });

    return res.status(200).json({ clientSecret: pi.client_secret });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error creating PaymentIntent" });
  }
}
