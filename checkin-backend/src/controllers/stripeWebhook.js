const getStripe = require("../config/stripe");
const Transaction = require("../models/Transaction");
const SubscriptionHistory = require("../models/SubscriptionHistory");

const User = require("../models/User");
const Subscription = require("../models/subscription");
const { addCredits, resetCredits } = require("../services/creditService");

exports.stripeWebhook = async (req, res) => {
  console.log("WEBHOOK HIT");
  
  const stripe = await getStripe();
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

  // res.json({ received: true });

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

        // =====================================
// 💰 SAVE TRANSACTION HERE (FINAL FIX)
// =====================================


    
        // ✅ STEP 2: subscription id lo
        const subscriptionId = session.subscription;
    
        // ✅ STEP 3: Stripe se full subscription fetch karo
        const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
    
        // ✅ STEP 4: dates convert karo
       // ✅ STEP 5: price id nikalo
       const priceId = stripeSub.items.data[0].price.id;

       // TRIAL ko alag plan rakho
       const isTrial = stripeSub.status === "trialing";
       
       const planType = isTrial
         ? "TRIAL"
         : priceId === process.env.STRIPE_PRICE_YEARLY
           ? "YEARLY"
           : "MONTHLY";


// ✅ STEP 7: dates convert karo
let start = null;
let end = null;

// ✅ SAFE extraction
if (stripeSub.current_period_start) {
  start = new Date(stripeSub.current_period_start * 1000);
}

if (stripeSub.current_period_end) {
  end = new Date(stripeSub.current_period_end * 1000);
}

// 🔥 FALLBACK (IMPORTANT)
if (!start || !end) {

  console.log("⚠️ USING FALLBACK FROM CREATED");

  const created = stripeSub.created
    ? new Date(stripeSub.created * 1000)
    : new Date();

  start = created;

  if (planType === "YEARLY") {
    end = new Date(created);
    end.setFullYear(end.getFullYear() + 1);
  } else {
    end = new Date(created);
    end.setMonth(end.getMonth() + 1);
  }
}
        // ✅ STEP 7: TRIAL CHECK (IMPORTANT)
        // const isTrial = stripeSub.status === "trialing";

        // ✅ TRIAL CREDIT ADD
if (isTrial) {
  await addCredits(userId, 1, "TRIAL");
}
    

const existingSub = await Subscription.findOne({ userId });

await SubscriptionHistory.create({
  userId,
  previousPlan: existingSub?.planType || "NONE",
  newPlan: planType,
  changedBy: "STRIPE"
});
        // ✅ STEP 8: DB update
        await Subscription.findOneAndUpdate(
          { userId },
          {
            planType,
            stripeSubscriptionId: subscriptionId,
            stripePriceId: priceId,
        
            startDate: start || new Date(),   // fallback
            endDate: end || null,
            nextRenewalDate: end || null,
        
            status: isTrial ? "TRIAL" : "ACTIVE",
            autoRenew: true,
            creditsPerCycle: 3
          },
          { upsert: true }
        );

        // 🔥 ADD THIS BLOCK

// ❗ Trial me payment nahi hota

    
        // ✅ STEP 9: USER UPDATE
        await User.findByIdAndUpdate(userId, {
          subscriptionStatus: isTrial ? "TRIAL" : "ACTIVE"
        });

       
    
        console.log("✅ Subscription created (trial or paid)");
      }}
    
      // =====================================
      // 🔹 TOP-UP FLOW
      // =====================================
      

    // =====================================
    // ✅ 2. RENEWAL PAYMENT
   // =====================================
// ✅ 2. RENEWAL PAYMENT
// =====================================
if (event.type === "invoice.payment_succeeded") {

  const invoice = event.data.object;

  const user = await User.findOne({
    stripeCustomerId: invoice.customer
  });

  if (!user) return;

  console.log("💰 INVOICE PAYMENT SUCCESS");

  const sub = await Subscription.findOne({
    userId: user._id
  });

  if (!sub) return;

  // Duplicate invoice check
  if (sub.lastInvoiceId === invoice.id) {
    console.log("⚠️ Invoice already processed");
    return;
  }

  // =====================================
  // 🔥 TRIAL → MONTHLY
  // =====================================

  const previousPlan = sub.planType;

  let newPlan = sub.planType;

  if (
    sub.status === "TRIAL" &&
    sub.stripePriceId === process.env.STRIPE_PRICE_MONTHLY
  ) {
    newPlan = "MONTHLY";

    console.log("🎉 FREE TRIAL ENDED → MONTHLY");
  }

  // =====================================
  // 📜 SAVE HISTORY
  // =====================================

  await SubscriptionHistory.create({
    userId: user._id,
    previousPlan,
    newPlan,
    changedBy: "RENEWAL"
  });

  // =====================================
  // ❌ CANCELLED CHECK
  // =====================================

  if (sub.status === "CANCELLED") {
    console.log(
      "⛔ Skipping update - subscription already cancelled"
    );
    return;
  }

  // =====================================
  // 💳 RESET + ADD MONTHLY/YEARLY CREDITS
  // =====================================

  await resetCredits(user._id);

  await addCredits(
    user._id,
    sub.creditsPerCycle || 3,
    "RENEWAL"
  );

  // =====================================
  // 🔥 UPDATE SUBSCRIPTION
  // =====================================

  sub.planType = newPlan;
  sub.status = "ACTIVE";
  sub.autoRenew = true;
  sub.lastInvoiceId = invoice.id;

  await sub.save();

  // =====================================
  // 🔥 UPDATE USER
  // =====================================

  await User.findByIdAndUpdate(user._id, {
    subscriptionStatus: "ACTIVE"
  });

  console.log(
    `✅ Subscription renewed: ${previousPlan} → ${newPlan}`
  );
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
      
      const oldPrice = sub.stripePriceId;
      const newPrice = priceId;
      
      const isUpgrade =
        oldPrice === process.env.STRIPE_PRICE_MONTHLY &&
        newPrice === process.env.STRIPE_PRICE_YEARLY;
      
      const isDowngrade =
        oldPrice === process.env.STRIPE_PRICE_YEARLY &&
        newPrice === process.env.STRIPE_PRICE_MONTHLY;
    
        if (isUpgrade) {
          console.log("🚀 UPGRADE");

          await SubscriptionHistory.create({
            userId: user._id,
            previousPlan: "MONTHLY",
            newPlan: "YEARLY",
            changedBy: "STRIPE_UPGRADE"
          });
        
          await resetCredits(user._id);
          await addCredits(user._id, 3, "RENEWAL");
        
          await Subscription.findOneAndUpdate(
            { userId: user._id },
            {
              planType: "YEARLY",
              stripePriceId: newPrice,
              status: "ACTIVE" // 🔥 IMPORTANT
            }
          );
        
          await User.findByIdAndUpdate(user._id, {
            subscriptionStatus: "ACTIVE" // 🔥 IMPORTANT
          });
        }
        
        if (isDowngrade) {
          console.log("📅 DOWNGRADE SCHEDULED");

          await SubscriptionHistory.create({
            userId: user._id,
            previousPlan: "YEARLY",
            newPlan: "MONTHLY",
            changedBy: "STRIPE_DOWNGRADE"
          });
        
          // ❌ plan change mat karo abhi
          // Stripe baad me karega
        
          await Subscription.findOneAndUpdate(
            { userId: user._id },
            {
              // keep yearly
              stripePriceId: oldPrice,
            }
          );
        }
    
        await Subscription.findOneAndUpdate(
          { userId: user._id },
          {
            cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
            autoRenew: stripeSub.cancel_at_period_end ? false : true
          }
        );
    
      console.log("✅ Subscription updated (upgrade/cancel)");
    }

    // =====================================
    // ❌ FINAL CANCEL
    // =====================================
   // =====================================
// ❌ FINAL CANCEL
// =====================================
if (event.type === "customer.subscription.deleted") {

  const stripeSub = event.data.object;

  const user = await User.findOne({
    stripeCustomerId: stripeSub.customer
  });

  if (!user) return;

  const sub = await Subscription.findOne({
    userId: user._id
  });

  await SubscriptionHistory.create({
    userId: user._id,
    previousPlan: sub?.planType || "NONE",
    newPlan: "CANCELLED",
    changedBy: "STRIPE"
  });

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

    // =====================================
// ✅ 4. CHARGE SUCCESS (FINAL )
if (event.type === "charge.succeeded") {

  const charge = event.data.object;

  console.log("🔥 CHARGE EVENT START");
  console.log("👉 PI:", charge.payment_intent);

  const txnId = charge.payment_intent;
  if (!txnId) return;

  const existing = await Transaction.findOne({
    stripePaymentIntentId: txnId
  });

  if (existing) {
    console.log("⚠️ Duplicate transaction");
    return;
  }

  // ===== DEFAULT =====
  let amount = charge.amount / 100;
  let fee = 0;
  let net = amount;
  let currency = charge.currency;

  // ===== GET REAL FEE =====
  if (charge.balance_transaction) {
    try {
      const balanceTx = await stripe.balanceTransactions.retrieve(
        charge.balance_transaction
      );

      amount = balanceTx.amount / 100;
      fee = balanceTx.fee / 100;
      net = balanceTx.net / 100;
      currency = balanceTx.currency;

      console.log("💰 Fee loaded");
    } catch {
      console.log("⚠️ Fee fetch failed");
    }
  }

  const user = await User.findOne({
    stripeCustomerId: charge.customer
  });

  if (!user) return;

  // =================================
  // 🔥 PLAN TYPE FIX (FINAL)
  // =================================

  const paymentIntent = await stripe.paymentIntents.retrieve(txnId);

  console.log("🧠 METADATA:", paymentIntent.metadata);

  let planType = "TOPUP";

  // ✅ TOPUP FIRST
  if (paymentIntent.metadata?.type === "TOPUP") {

    planType = "TOPUP";
    console.log("💰 TOPUP DETECTED");

  } else {

    const sub = await Subscription.findOne({
      userId: user._id
    });

    if (sub && sub.planType) {
      planType = sub.planType;
      console.log("✅ PLAN FROM SUB:", planType);
    }
  }

  console.log("🎯 FINAL PLAN:", planType);

  // =================================
  // ✅ SAVE TRANSACTION
  // =================================
  await Transaction.create({
    userId: user._id,
    stripePaymentIntentId: txnId,
    stripeBalanceTransactionId: charge.balance_transaction,
    amount,
    fee,
    net,
    currency,
    planType,
    status: "SUCCESS"
  });

  // =================================
  // 🔥 SUBSCRIPTION FIRST PAYMENT
  // =================================
  if (planType === "MONTHLY" || planType === "YEARLY") {

    const sub = await Subscription.findOne({
      userId: user._id
    });

    if (sub) {
      await resetCredits(user._id);

      await addCredits(
        user._id,
        sub.creditsPerCycle || 3,
        "RENEWAL"
      );

      sub.status = "ACTIVE";
      await sub.save();

      await User.findByIdAndUpdate(user._id, {
        subscriptionStatus: "ACTIVE"
      });

      console.log("✅ Subscription credits added");
    }
  }

  // =================================
  // 🔥 TOPUP CREDITS
  // =================================
  if (planType === "TOPUP") {

    const priceId = paymentIntent.metadata?.priceId;

    let credits = 0;

    if (priceId === process.env.STRIPE_PRICE_TOPUP_3) credits = 3;
    if (priceId === process.env.STRIPE_PRICE_TOPUP_5) credits = 5;

    if (credits > 0) {
      await addCredits(user._id, credits, "TOPUP");
      console.log("💰 TOPUP credits added:", credits);
    }
  }

  // =================================
  // 🔥 RETRY FEE (IF NULL)
  // =================================
  if (!charge.balance_transaction) {

    console.log("⚠️ Fee retry...");

    setTimeout(async () => {
      try {
        const pi = await stripe.paymentIntents.retrieve(txnId);

        if (pi.latest_charge) {
          const ch = await stripe.charges.retrieve(pi.latest_charge);

          if (ch.balance_transaction) {
            const balanceTx = await stripe.balanceTransactions.retrieve(
              ch.balance_transaction
            );

            await Transaction.findOneAndUpdate(
              { stripePaymentIntentId: txnId },
              {
                fee: balanceTx.fee / 100,
                net: balanceTx.net / 100
              }
            );

            console.log("✅ Fee updated after retry");
          }
        }
      } catch {
        console.log("❌ Retry failed");
      }
    }, 5000);
  }

  console.log("💰 Transaction done");
}



} catch (error) {
console.log("❌ Webhook error:", error.message);
}

res.status(200).send("OK");
};


