const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Transaction = require("../models/transaction");

const User = require("../models/User");
const Subscription = require("../models/subscription");
const { addCredits, resetCredits } = require("../services/creditService");

exports.stripeWebhook = async (req, res) => {
  console.log("🔥 WEBHOOK HIT");

  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log("❌ Webhook signature failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {

    // =====================================
    // ✅ 1. CHECKOUT COMPLETED
    if (event.type === "checkout.session.completed") {

      const session = event.data.object;
    
      // ✅ STEP 1: USER ID nikalo
      const userId = session.metadata.userId;
    
      // =====================================
      // 🔹 SUBSCRIPTION FLOW
      // =====================================
      if (session.mode === "subscription") {
    
        // ✅ STEP 2: subscription id lo
        const subscriptionId = session.subscription;
    
        // ✅ STEP 3: Stripe se full subscription fetch karo
        const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
    
        // ✅ STEP 4: dates convert karo
        const start = new Date(stripeSub.current_period_start * 1000);
        const end = new Date(stripeSub.current_period_end * 1000);
    
        // ✅ STEP 5: price id nikalo
        const priceId = stripeSub.items.data[0].price.id;
    
        // ✅ STEP 6: plan detect karo
        const planType =
          priceId === process.env.STRIPE_PRICE_YEARLY
            ? "YEARLY"
            : "MONTHLY";
    
        // ✅ STEP 7: TRIAL CHECK (IMPORTANT)
        const isTrial = stripeSub.status === "trialing";

        // ✅ TRIAL CREDIT ADD
if (isTrial) {
  await addCredits(userId, 1, "TRIAL");
}
    
        // ✅ STEP 8: DB update
        await Subscription.findOneAndUpdate(
          { userId },
          {
            planType,
            stripeSubscriptionId: subscriptionId,
            stripePriceId: priceId,
        
            currentPeriodStart: start,
            currentPeriodEnd: end,
        
            status: isTrial ? "TRIAL" : "ACTIVE",
            autoRenew: true,
        
            creditsPerCycle: 3 
          },
          { upsert: true }
        );
    
        // ✅ STEP 9: USER UPDATE
        await User.findByIdAndUpdate(userId, {
          subscriptionStatus: isTrial ? "TRIAL" : "ACTIVE"
        });

       
    
        console.log("✅ Subscription created (trial or paid)");
      }
    
      // =====================================
      // 🔹 TOP-UP FLOW
      // =====================================
      if (session.mode === "payment") {
    
        const user = await User.findOne({
          stripeCustomerId: session.customer
        });
    
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        const priceId = lineItems.data[0].price.id;
    
        let credits = 0;
    
        if (priceId === process.env.STRIPE_PRICE_TOPUP_3) credits = 3;
        if (priceId === process.env.STRIPE_PRICE_TOPUP_5) credits = 5;
    
        if (credits > 0) {
          await addCredits(user._id, credits, "TOPUP");
          console.log("💰 Top-up credits added:", credits);
        }

        const paymentIntent = await stripe.paymentIntents.retrieve(
          session.payment_intent
        );
        
        const charge = await stripe.charges.retrieve(
          paymentIntent.latest_charge
        );
        
        const balanceTx = await stripe.balanceTransactions.retrieve(
          charge.balance_transaction
        );
        
        await Transaction.create({
          userId: user._id,
          stripePaymentIntentId: paymentIntent.id,
          stripeBalanceTransactionId: balanceTx.id,
        
          amount: balanceTx.amount / 100,
          fee: balanceTx.fee / 100,
          net: balanceTx.net / 100,
        
          currency: balanceTx.currency,
          type: "TOPUP",
          status: "SUCCESS"
        });
      }
    }

    // =====================================
    // ✅ 2. RENEWAL PAYMENT
    if (event.type === "invoice.payment_succeeded") {

      const invoice = event.data.object;
    
      const user = await User.findOne({
        stripeCustomerId: invoice.customer
      });
    
      if (!user) return;
    
      const sub = await Subscription.findOne({ userId: user._id });
    
      if (sub.lastInvoiceId === invoice.id) return;
    
      // ✅ credits reset
      await resetCredits(user._id);
      await addCredits(user._id, sub.creditsPerCycle || 3, "RENEWAL");
    
      // ✅ TRIAL → ACTIVE conversion
      await User.findByIdAndUpdate(user._id, {
        subscriptionStatus: "ACTIVE"
      });
    
      sub.lastInvoiceId = invoice.id;
    
      sub.currentPeriodStart = new Date(invoice.period_start * 1000);
      sub.currentPeriodEnd = new Date(invoice.period_end * 1000);
    
      await sub.save();

      const charge = await stripe.charges.retrieve(invoice.charge);

const balanceTx = await stripe.balanceTransactions.retrieve(
  charge.balance_transaction
);

await Transaction.create({
  userId: user._id,
  stripePaymentIntentId: charge.payment_intent,
  stripeBalanceTransactionId: balanceTx.id,

  amount: balanceTx.amount / 100,
  fee: balanceTx.fee / 100,
  net: balanceTx.net / 100,

  currency: balanceTx.currency,
  type: "SUBSCRIPTION",
  status: "SUCCESS"
});
    
      console.log("🔄 Subscription renewed or trial converted");
    }

    // =====================================
    // ✅ 3. CANCEL REQUEST (period end)
    // =====================================
    if (event.type === "customer.subscription.updated") {

      const stripeSub = event.data.object;
    
      const user = await User.findOne({
        stripeCustomerId: stripeSub.customer
      });
    
      if (!user) return;
    
      // ✅ STEP 1: get price id
      const priceId = stripeSub.items.data[0].price.id;
    
      const planType =
        priceId === process.env.STRIPE_PRICE_YEARLY
          ? "YEARLY"
          : "MONTHLY";
    
      // ✅ STEP 2: detect cancel
      const cancelAtPeriodEnd = stripeSub.cancel_at_period_end;
    
      // ✅ STEP 3: update DB
      const sub = await Subscription.findOne({ userId: user._id });

      // 🛑 IMPORTANT FIX
      if (!sub) {
        console.log("⚠️ Subscription not found yet (webhook order issue)");
        return;
      }
      
      // duplicate check
      if (sub.lastInvoiceId === invoice.id) return;
      const isUpgrade = sub.stripePriceId !== priceId;
    
      // =====================================
      // 🔥 UPGRADE DETECTED
      // =====================================
      if (isUpgrade) {
    
        console.log("🚀 PLAN UPGRADED");
    
        // ❌ reset old credits
        await resetCredits(user._id);
    
        // ✅ new credits
        await addCredits(user._id, 3, "RENEWAL");
      }
    
      await Subscription.findOneAndUpdate(
        { userId: user._id },
        {
          planType,
          stripePriceId: priceId,
          cancelAtPeriodEnd,
          autoRenew: !cancelAtPeriodEnd
        }
      );
    
      console.log("✅ Subscription updated (upgrade/cancel)");
    }

    // =====================================
    // ❌ FINAL CANCEL
    // =====================================
    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object;

      const user = await User.findOne({
        stripeCustomerId: sub.customer
      });

      if (!user) return;

      await Subscription.findOneAndUpdate(
        { userId: user._id },
        {
          status: "CANCELLED",
          autoRenew: false
        }
      );

      await User.findByIdAndUpdate(user._id, {
        subscriptionStatus: "CANCELLED"
      });

      console.log("❌ Subscription cancelled fully");
    }

    if (event.type === "charge.refunded") {

      const charge = event.data.object;
    
      await Transaction.findOneAndUpdate(
        { stripePaymentIntentId: charge.payment_intent },
        { status: "REFUNDED" }
      );
    
      console.log("💸 Refund processed");
    }

  } catch (error) {
    console.log("❌ Webhook error:", error.message);
  }

  res.json({ received: true });
};