const getStripe = require("../config/stripe");
const User = require("../models/User");
const Subscription = require("../models/subscription");
const Transaction = require("../models/Transaction");

exports.createTrialSession = async (req, res) => {
  try {
    const stripe = await getStripe();
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email
      });

      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await user.save();
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",

      customer: customerId,

      line_items: [
        {
          price: process.env.STRIPE_PRICE_MONTHLY,
          quantity: 1
        }
      ],

      subscription_data: {
        trial_period_days: 7,

        metadata: {
          userId: user._id.toString(),
          priceId: process.env.STRIPE_PRICE_MONTHLY,
          type: "FREE_TRIAL"
        }
      },

      metadata: {
        userId: user._id.toString(),
        priceId: process.env.STRIPE_PRICE_MONTHLY,
        type: "FREE_TRIAL"
      },

      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel"
    });

    res.json({
      url: session.url
    });

  } catch (error) {
    console.error("❌ Trial Stripe Error:", error.message);

    res.status(500).json({
      message: error.message
    });
  }
};

exports.createSubscriptionSession = async (req, res) => {
    try {
      const stripe = await getStripe();
      const { priceId } = req.body;
  
      const user = await User.findById(req.user.userId);
  
      // ✅ STEP 1: CHECK ACTIVE SUBSCRIPTION
      const existingSub = await Subscription.findOne({
        userId: user._id,
        status: { $in: ["ACTIVE", "TRIAL"] },
autoRenew: true
      });
  
      if (existingSub) {
        return res.status(400).json({
          message: "You already have an active subscription"
        });
      }
  
      // ✅ STEP 2: CREATE / GET STRIPE CUSTOMER
      let customerId = user.stripeCustomerId;
  
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
        });
  
        customerId = customer.id;
        user.stripeCustomerId = customerId;
        await user.save();
      }
  
      // ✅ STEP 3: CREATE SESSION
      // const isMonthly = priceId === process.env.STRIPE_PRICE_MONTHLY;

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: customerId,
      
        line_items: [
          {
            price: priceId,
            quantity: 1
          }
        ],
      
        // ❌ NO TRIAL HERE
        // Direct Monthly / Yearly purchase will be charged normally
      
        subscription_data: {
          metadata: {
            userId: user._id.toString(),
            priceId: priceId,
            type: "PAID_SUBSCRIPTION"
          }
        },
      
        metadata: {
          userId: user._id.toString(),
          priceId: priceId,
          type: "PAID_SUBSCRIPTION"
        },
      
        success_url: "http://localhost:3000/success",
        cancel_url: "http://localhost:3000/cancel"
      });
  
      res.json({ url: session.url });
  
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

exports.cancelSubscription = async (req, res) => {
    try {
      const stripe = await getStripe();
      const userId = req.user.userId;
  
      const sub = await Subscription.findOne({ userId });
  
      if (!sub || !sub.stripeSubscriptionId) {
        return res.status(400).json({ message: "No active subscription" });
      }
  
      await stripe.subscriptions.update(sub.stripeSubscriptionId, {
        cancel_at_period_end: true
      });

      await Subscription.findOneAndUpdate(
        { userId },
        { autoRenew: false }
      );
  
      res.json({
        message: "Subscription will cancel at period end"
      });
  
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };


  // exports.upgradeSubscription = async (req, res) => {
  //   try {
  //     const userId = req.user.userId;
  
  //     const user = await User.findById(userId);
  
  //     const sub = await Subscription.findOne({ userId });
  
  //     if (!sub || !sub.stripeSubscriptionId) {
  //       return res.status(400).json({ message: "No active subscription" });
  //     }
  
  //     // ❗ Already yearly check
  //     if (sub.stripePriceId === process.env.STRIPE_PRICE_YEARLY) {
  //       return res.status(400).json({ message: "Already on yearly plan" });
  //     }
  
  //     // 🔥 CREATE CHECKOUT SESSION FOR UPGRADE
  //     const session = await stripe.checkout.sessions.create({
  //       mode: "subscription",
  
  //       customer: user.stripeCustomerId,
  
  //       line_items: [
  //         {
  //           price: process.env.STRIPE_PRICE_YEARLY,
  //           quantity: 1,
  //         },
  //       ],
  
  //       subscription_data: {
  //         metadata: {
  //           userId: userId.toString(),
  //         },
  
  //         // 🔥 IMPORTANT: EXISTING SUB PASS KARNA
  //         // ❌ directly possible nahi hai in checkout
  //         // 👉 so we let Stripe handle proration automatically
  //       },
  
  //       success_url: "http://localhost:3000/success",
  //       cancel_url: "http://localhost:3000/cancel",
  //     });
  
  //     res.json({ url: session.url });
  
  //   } catch (error) {
  //     res.status(500).json({ message: error.message });
  //   }
  // };


  exports.refundPayment = async (req, res) => {
    try {
      const stripe = await getStripe();
      const { paymentIntentId, reason  } = req.body;
  
      // ✅ STEP 1: find transaction
      const txn = await Transaction.findOne({
        stripePaymentIntentId: paymentIntentId
      });
  
      if (!txn) {
        return res.status(404).json({ message: "Transaction not found" });
      }
  
      // ❌ already refunded check
      if (txn.status === "REFUNDED") {
        return res.status(400).json({ message: "Already refunded" });
      }

      const createdAt = txn.createdAt;
const now = new Date();

const diffMinutes = (now - createdAt) / (1000 * 60);

if (diffMinutes > 30) {
  return res.status(400).json({ message: "Refund window expired" });
}

// ❗ CREDIT USAGE CHECK (ADD HERE)
if (txn.type === "SUBSCRIPTION") {

  const sub = await Subscription.findOne({ userId: txn.userId });

  // simple logic (adjust if needed)
  if (sub && sub.creditsUsed > 0) {
    return res.status(400).json({
      message: "Cannot refund after using credits"
    });
  }
}
  
      // ✅ STEP 2: create refund in stripe
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId
      });
      
      // ✅ UPDATE TRANSACTION
      txn.status = "REFUNDED";
      txn.refundReason = reason; // admin note
      txn.refundId = refund.id;
      
      // 🔥 NEW (IMPORTANT)
      txn.refundStatus = "COMPLETED";
      
      // ❗ user ka reason already saved hoga (SupportTicket se)
      // so usko overwrite mat karna
      
      await txn.save();
  
      // =========================================
      // 🔥 STEP 4: HANDLE SUBSCRIPTION CANCEL
      // =========================================
  
      // if (txn.type === "SUBSCRIPTION") {
  
      //   const sub = await Subscription.findOne({ userId: txn.userId });
  
      //   if (sub && sub.stripeSubscriptionId) {
  
      //     // ❗ immediately cancel in Stripe
      //     await stripe.subscriptions.cancel(sub.stripeSubscriptionId, {
      //       invoice_now: true,
      //       prorate: false
      //     });
  
      //     // ❗ update DB
      //     sub.status = "CANCELLED";
      //     sub.autoRenew = false;
      //     await sub.save();
      //   }
  
      //   // ❗ update user
      //   await User.findByIdAndUpdate(txn.userId, {
      //     subscriptionStatus: "CANCELLED"
      //   });
      // }

      if (txn.planType === "MONTHLY" || txn.planType === "YEARLY") {

        const sub = await Subscription.findOne({ userId: txn.userId });
      
        if (sub && sub.stripeSubscriptionId) {
      
          await stripe.subscriptions.cancel(sub.stripeSubscriptionId, {
            invoice_now: true,
            prorate: false
          });
      
          sub.status = "CANCELLED";
          sub.autoRenew = false;
          await sub.save();
        }
      
        await User.findByIdAndUpdate(txn.userId, {
          subscriptionStatus: "CANCELLED"
        });
      }
  
      res.json({
        message: "Refund successful",
        refund
      });
  
    } catch (error) {

      console.log("❌ Refund error:", error.message);
    
      if (txn) {
        txn.refundStatus = "FAILED";
        await txn.save();
      }
    
      res.status(500).json({ message: error.message });
    }
  };

  exports.createTopupSession = async (req, res) => {
    try {
      const stripe = await getStripe();
      const { priceId } = req.body;
  
      const user = await User.findById(req.user.userId);
  
      const sub = await Subscription.findOne({
        userId: user._id,
        status: "ACTIVE"
      });
  
      if (!sub) {
        return res.status(400).json({
          message: "Please subscribe before purchasing top-up"
        });
      }
  
      let customerId = user.stripeCustomerId;
  
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
        });
  
        customerId = customer.id;
        user.stripeCustomerId = customerId;
        await user.save();
      }
  
      // 🔥 FINAL FIXED SESSION
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer: customerId,
  
        line_items: [{ price: priceId, quantity: 1 }],
  
        payment_intent_data: {
          metadata: {
            userId: user._id.toString(),
            priceId: priceId,
            type: "TOPUP" // 🔥 MUST
          }
        },
  
        success_url: "http://localhost:3000/success",
        cancel_url: "http://localhost:3000/cancel",
      });
  
      res.json({ url: session.url });
  
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };


  exports.openCustomerPortal = async (req, res) => {
    try {
       const stripe = await getStripe();
      const userId = req.user.userId;
  
      const user = await User.findById(userId);
  
      if (!user.stripeCustomerId) {
        return res.status(400).json({
          message: "Stripe customer not found"
        });
      }
  
      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
  
        return_url: "http://localhost:3000/subscription", // 👈 apni UI ka page
      });
  
      res.json({ url: session.url });
  
    } catch (error) {
      console.log("❌ Portal Error:", error.message);
      res.status(500).json({ message: error.message });
    }
  };