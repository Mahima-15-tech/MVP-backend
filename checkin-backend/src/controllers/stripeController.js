const stripe = require("../config/stripe");
const User = require("../models/User");
const Subscription = require("../models/subscription");


exports.createSubscriptionSession = async (req, res) => {
    try {
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
      const isMonthly = priceId === process.env.STRIPE_PRICE_MONTHLY;

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: customerId,
      
        line_items: [{ price: priceId, quantity: 1 }],
      
        subscription_data: isMonthly
          ? { trial_period_days: 7 } // 🔥 ONLY monthly me trial
          : {},
      
        metadata: {
          userId: user._id.toString()
        },
      
        success_url: "http://localhost:3000/success",
        cancel_url: "http://localhost:3000/cancel",
      });
  
      res.json({ url: session.url });
  
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

exports.cancelSubscription = async (req, res) => {
    try {
      const userId = req.user.userId;
  
      const sub = await Subscription.findOne({ userId });
  
      if (!sub || !sub.stripeSubscriptionId) {
        return res.status(400).json({ message: "No active subscription" });
      }
  
      await stripe.subscriptions.update(sub.stripeSubscriptionId, {
        cancel_at_period_end: true
      });
  
      res.json({
        message: "Subscription will cancel at period end"
      });
  
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };


  exports.upgradeSubscription = async (req, res) => {
    try {
      const userId = req.user.userId;
  
      // ✅ STEP 1: find current subscription
      const sub = await Subscription.findOne({ userId });

      if (!sub || !sub.stripeSubscriptionId) {
        return res.status(400).json({ message: "No active subscription" });
      }
      

      if (sub.stripePriceId === process.env.STRIPE_PRICE_YEARLY) {
        return res.status(400).json({
          message: "Already on yearly plan"
        });
      }
  
      // ✅ STEP 2: get stripe subscription
      const stripeSub = await stripe.subscriptions.retrieve(
        sub.stripeSubscriptionId
      );
  
      // ✅ STEP 3: get subscription item id
      const itemId = stripeSub.items.data[0].id;
  
      // ✅ STEP 4: update to yearly
      await stripe.subscriptions.update(sub.stripeSubscriptionId, {
        items: [
          {
            id: itemId,
            price: process.env.STRIPE_PRICE_YEARLY,
          },
        ],
        proration_behavior: "create_prorations", // 🔥 important
      });
  
      res.json({
        message: "Upgrade initiated successfully"
      });
  
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };


  exports.refundPayment = async (req, res) => {
    try {
  
      const { paymentIntentId } = req.body;
  
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId
      });
  
      // OPTIONAL: mark transaction
      await Transaction.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntentId },
        { status: "REFUNDED" }
      );
  
      res.json({
        message: "Refund successful",
        refund
      });
  
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };