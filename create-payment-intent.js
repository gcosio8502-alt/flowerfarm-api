// /api/create-payment-intent.js  (Vercel Serverless Function)
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// CORS básico (ajústalo a tu dominio en producción)
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { amount, currency = "usd", metadata = {} } = req.body || {};
    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: "Missing or invalid 'amount' (cents)" });
    }

    const pi = await stripe.paymentIntents.create({
      amount: Math.round(Number(amount)), // centavos
      currency,
      automatic_payment_methods: { enabled: true },
      metadata
    });

    return res.status(200).json({ clientSecret: pi.client_secret });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
