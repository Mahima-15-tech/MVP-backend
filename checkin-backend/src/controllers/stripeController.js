const stripe = require("../config/stripe");
const User = require("../models/User");

exports.createSubscriptionSession = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: user.stripeCustomerId,

      line_items: [
        {
          price: process.env.STRIPE_PRICE_MONTHLY,
          quantity: 1,
        },
      ],

      success_url: "http://localhost:3000",
cancel_url: "http://localhost:3000",
    });

    res.json({ url: session.url });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};