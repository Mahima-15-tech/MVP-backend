const Subscription = require("../models/subscription");
const User = require("../models/User");
const { addCredits,  getUserBalance, resetCredits  } = require("../services/creditService");
const PhoneRegistry = require("../models/PhoneRegistry");
const SubscriptionHistory = require("../models/SubscriptionHistory");
const buildSubscriptionResponse = require("../../utils/buildSubscriptionResponse");

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

    const updatedUser = await User.findById(userId);
    const subscription = await buildSubscriptionResponse(updatedUser);
    
    res.json({
      status: 1,
      message: "Free trial started",
      subscription
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.purchasePlan = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { planType } = req.body;

    let credits;

    if (planType === "MONTHLY") {
      credits = 3;
    } else if (planType === "YEARLY") {
      credits = 3; // monthly cycle for yearly
    } else {
      return res.status(400).json({ message: "Invalid plan" });
    }

    const startDate = new Date();
    const endDate = new Date(startDate);

    // ✅ set expiry
    if (planType === "MONTHLY") {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    let sub = await Subscription.findOne({ userId });

    if (!sub) {
      return res.status(400).json({ message: "No existing subscription found" });
    }

    // 🔥 history
    await SubscriptionHistory.create({
      userId,
      previousPlan: sub.planType,
      newPlan: planType,
      changedBy: "USER"
    });

    // 🔥 update subscription
    sub.planType = planType;
    sub.startDate = startDate;
    sub.endDate = endDate;
    sub.creditsPerCycle = credits;
    sub.status = "ACTIVE";

    // ✅ IMPORTANT LOGIC
    if (planType === "YEARLY") {
      const nextRenewal = new Date(startDate);
      nextRenewal.setMonth(nextRenewal.getMonth() + 1);
      sub.nextRenewalDate = nextRenewal;
    } else {
      sub.nextRenewalDate = null; // ❌ monthly doesn't auto renew
    }

    await sub.save();

    // ❗ reset old credits (trial/topup)
    await resetCredits(userId);

    // ✅ add fresh credits (3)
    await addCredits(userId, credits, "RENEWAL");

    const updatedUser = await User.findById(userId);
    const subscription = await buildSubscriptionResponse(updatedUser);

    res.json({
      status: 1,
      message: "Subscription activated",
      subscription
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.buyTopup = async (req, res) => {
  try {

    const userId = req.user.userId;
    const { credits } = req.body; // 3 or 5

    if (![3, 5].includes(credits)) {
      return res.status(400).json({ message: "Invalid topup" });
    }

    const sub = await Subscription.findOne({ userId });

    // ❌ NOT ALLOWED FOR TRIAL OR NO PLAN
    if (!sub || sub.planType === "TRIAL") {
      return res.status(400).json({
        message: "Top-up only for paid users"
      });
    }

    if (sub.status !== "ACTIVE") {
      return res.status(400).json({
        message: "Subscription inactive"
      });
    }

    // ✅ ADD TOPUP
    await addCredits(userId, credits, "TOPUP");

    const updatedUser = await User.findById(userId);
    const subscription = await buildSubscriptionResponse(updatedUser);
    
    res.json({
      status: 1,
      message: "Top-up added",
      creditsAdded: credits,
      subscription
    });

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