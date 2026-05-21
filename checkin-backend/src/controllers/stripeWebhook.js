const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// exports.stripeWebhook = (req, res) => {
//   const sig = req.headers["stripe-signature"];

//   let event;

//   try {
//     event = stripe.webhooks.constructEvent(
//       req.body,
//       sig,
//       process.env.STRIPE_WEBHOOK_SECRET
//     );
//   } catch (err) {
//     console.log("❌ Webhook Error:", err.message);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   // ✅ PAYMENT SUCCESS
//   if (event.type === "checkout.session.completed") {
//     console.log("🔥 Payment Successful");

//     const session = event.data.object;

//     console.log("Session ID:", session.id);

//     // 👉 yaha DB update karenge next step me
//   }

//   res.json({ received: true });
// };

exports.stripeWebhook = (req, res) => {
    console.log("🔥 WEBHOOK HIT");
  
    const event = req.body;
  
    if (event.type === "checkout.session.completed") {
      console.log("✅ PAYMENT SUCCESS WITHOUT VERIFY");
    }
  
    res.json({ received: true });
  };