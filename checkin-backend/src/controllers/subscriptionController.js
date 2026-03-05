const Subscription = require("../models/subscription");
const User = require("../models/User");
const { addCredits,  getUserBalance } = require("../services/creditService");
const PhoneRegistry = require("../models/PhoneRegistry");
const SubscriptionHistory = require("../models/SubscriptionHistory");

exports.startFreeTrial = async (req, res) => {
  try {
    const userId = req.user.userId;

    // 1️⃣ Get user first
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2️⃣ Check Phone Registry
    const registry = await PhoneRegistry.findOne({ phone: user.phone });

    if (registry && registry.trialUsed) {
      return res.status(400).json({
        message: "Free trial already used on this number."
      });
    }

    // 3️⃣ Check existing subscription
    const existingSub = await Subscription.findOne({ userId });

    if (existingSub) {
      return res.status(400).json({
        message: "Subscription already exists"
      });
    }

    // 4️⃣ Create trial subscription
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);

    await Subscription.create({
      userId,
      planType: "TRIAL",
      startDate,
      endDate,
      nextRenewalDate: endDate,
      creditsPerCycle: 1,
      autoRenew: true,
      trialUsed: true,
    });

    // 5️⃣ Update user status
    await User.findByIdAndUpdate(userId, {
      subscriptionStatus: "ACTIVE",
    });

    // 6️⃣ Add trial credit
    await addCredits(userId, 1, "TRIAL");

    // 7️⃣ Mark registry trial used
    if (registry) {
      registry.trialUsed = true;
      await registry.save();
    }

    res.json({ message: "Free trial started" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.purchasePlan = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { planType } = req.body;

    let durationDays;
    let credits;

    if (planType === "MONTHLY") {
      durationDays = 30;
      credits = 3;
    } else if (planType === "YEARLY") {
      durationDays = 365;
      credits = 36;
    } else {
      return res.status(400).json({ message: "Invalid plan" });
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationDays);

    let sub = await Subscription.findOne({ userId });

    if (!sub) {
      return res.status(400).json({ message: "No existing subscription found" });
    }

    // 🔥 CREATE HISTORY
    await SubscriptionHistory.create({
      userId,
      previousPlan: sub.planType,
      newPlan: planType,
      changedBy: "USER"
    });

    // 🔥 UPDATE SUB
    sub.planType = planType;
    sub.startDate = startDate;
    sub.endDate = endDate;
    sub.nextRenewalDate = endDate;
    sub.creditsPerCycle = credits;
    sub.autoRenew = true;
    sub.status = "ACTIVE";

    await sub.save();

    await User.findByIdAndUpdate(userId, {
      subscriptionStatus: "ACTIVE",
    });

    await addCredits(userId, credits, "TOPUP");

    res.json({ message: "Subscription activated" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
  

  exports.getSubscriptionStatus = async (req, res) => {
    try {
  
      const userId = req.user.userId;
  
      const sub = await Subscription.findOne({ userId }).sort({ createdAt: -1 });
  
      if (!sub) {
        return res.json({
          hasSubscription: false
        });
      }
  
      const now = new Date();
      const endDate = new Date(sub.endDate);
  
      const daysRemaining = Math.max(
        Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)),
        0
      );
  
      const creditsRemaining = await getUserBalance(userId);
  
      res.json({
        hasSubscription: true,
        planType: sub.planType,
        status: sub.status,
        startDate: sub.startDate,
        endDate: sub.endDate,
        daysRemaining,
        creditsRemaining,
        autoRenew: sub.autoRenew
      });
  
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  exports.cancelSubscription = async (req, res) => {
    try {
  
      const userId = req.user.userId;
  
      const sub = await Subscription.findOne({ userId });
  
      if (!sub) {
        return res.status(404).json({ message: "No subscription found" });
      }
  
      sub.autoRenew = false;
      await sub.save();
  
      res.json({
        message: "Subscription will not renew after current cycle",
        endDate: sub.endDate
      });
  
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };