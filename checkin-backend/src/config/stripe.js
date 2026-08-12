const Stripe = require("stripe");
const Settings = require("../models/Settings");

let stripeClient = null;
let currentKey = null;

const getStripe = async () => {
  const settings = await Settings.findOne();

  const stripeKey =
    settings?.stripeSecretKey || process.env.STRIPE_SECRET_KEY;

  if (!stripeKey) {
    throw new Error("Stripe Secret Key is not configured");
  }

  // Key change hui hai to new Stripe client create hoga
  if (!stripeClient || currentKey !== stripeKey) {
    stripeClient = new Stripe(stripeKey);
    currentKey = stripeKey;

    console.log("✅ Stripe client initialized/updated");
  }

  return stripeClient;
};

module.exports = getStripe;