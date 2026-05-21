const Subscription = require("../src/models/subscription");
const CreditTransaction = require("../src/models/creditTransaction");

module.exports = async function buildSubscriptionResponse(user) {

  const sub = await Subscription.findOne({ userId: user._id });

  // ===============================
  // ❌ NO SUBSCRIPTION → FREE
  // ===============================
  if (!sub) {
    return {
      status: 0,
      statusText: "FREE",
      isActive: false,
      expiryDate: null,
      duration: 0,
      credits: {
        remaining: 0,
        total: 0,
        planCredits: 0,
        topupCredits: 0,
        hasLowCredits: false
      }
    };
  }

  // ===============================
  // ✅ GET CREDITS
  // ===============================
  const credits = await CreditTransaction.find({ userId: user._id });

  let totalCredits = 0;

  credits.forEach(tx => {
    if (tx.type === "ADD") totalCredits += tx.amount;
    else totalCredits -= tx.amount;
  });

  // ===============================
  // 🟡 TRIAL
  // ===============================
  if (sub.status === "TRIAL") {
    return {
      status: 1,
      statusText: "TRIAL",
      isActive: true,
      expiryDate: sub.currentPeriodEnd,
      duration: 7,
      credits: {
        remaining: totalCredits,
        total: totalCredits,
        planCredits: 1,
        topupCredits: 0,
        hasLowCredits: totalCredits <= 1
      }
    };
  }

  // ===============================
  // 🟢 ACTIVE
  // ===============================
  if (sub.status === "ACTIVE") {
    return {
      status: 1,
      statusText: "ACTIVE",
      isActive: true,
      expiryDate: sub.currentPeriodEnd,
      duration: sub.planType === "YEARLY" ? 365 : 30,
      credits: {
        remaining: totalCredits,
        total: totalCredits,
        planCredits: sub.creditsPerCycle || 3,
        topupCredits: 0,
        hasLowCredits: totalCredits <= 1
      }
    };
  }

  // ===============================
  // 🔴 CANCELLED / EXPIRED
  // ===============================
  return {
    status: 0,
    statusText: "EXPIRED",
    isActive: false,
    expiryDate: sub.currentPeriodEnd,
    duration: 0,
    credits: {
      remaining: totalCredits,
      total: totalCredits,
      planCredits: 0,
      topupCredits: 0,
      hasLowCredits: true
    }
  };
};