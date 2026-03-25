const Subscription = require("../src/models/subscription");
const PhoneRegistry = require("../src/models/PhoneRegistry");
const { getUserBalance } = require("../src/services/creditService");
const CreditTransaction = require("../src/models/creditTransaction");

module.exports = async function buildSubscriptionResponse(user) {

  const sub = await Subscription.findOne({ userId: user._id });
  const registry = await PhoneRegistry.findOne({ phone: user.phone });

  let status = 0;
  let statusText = "FREE";
  let isActive = false;
  let expiryDate = null;

  let maxContacts = 0;   // ✅ FREE = 0
  let maxCheckins = 0;

  let planCredits = 0;
  let totalCredits = 0;
  let duration = 0;

  if (sub && sub.status === "ACTIVE") {
    isActive = true;
    expiryDate = sub.endDate;
    maxCheckins = 2;

    if (sub.planType === "TRIAL") {
      status = 1;
      statusText = "TRIAL";
      maxContacts = 1;
      planCredits = 1;
    }

    if (sub.planType === "MONTHLY") {
      status = 2;
      statusText = "MONTHLY";
      maxContacts = 2;
      planCredits = 3;
    }

    if (sub.planType === "YEARLY") {
        status = 3;
        statusText = "YEARLY";
        maxContacts = 2;
        planCredits = 3; // ✅ FIXED
      }

    // ✅ duration dynamic
    if (sub.startDate && sub.endDate) {
      const start = new Date(sub.startDate);
      const end = new Date(sub.endDate);

      duration = Math.ceil(
        (end - start) / (1000 * 60 * 60 * 24)
      );
    }
  }

  // ✅ CURRENT BALANCE (remaining)
  const creditsRemaining = await getUserBalance(user._id);

  // ✅ FIND TOTAL ADDED (plan + topup)
 totalCredits = planCredits;

if (sub && sub.startDate) {
  const topupTxs = await CreditTransaction.aggregate([
    {
      $match: {
        userId: user._id,
        type: "ADD",
        reason: "TOPUP", // 🔥 only topups
        createdAt: { $gte: sub.startDate } // 🔥 ONLY current plan
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" }
      }
    }
  ]);

 


  const topupTotal = topupTxs.length ? topupTxs[0].total : 0;

  totalCredits = planCredits + topupTotal;
}

const hasLowCredits =
isActive &&
(status === 2 || status === 3) && // only monthly/yearly
creditsRemaining <= 1;



  // ✅ days left
  let daysLeft = 0;
  if (sub && sub.endDate) {
    const now = new Date();
    const end = new Date(sub.endDate);

    daysLeft = Math.max(
      Math.ceil((end - now) / (1000 * 60 * 60 * 24)),
      0
    );
  }

  // ✅ isUsed → ONLY after current plan start
  let isUsed = false;

  if (sub && sub.startDate) {
    const usedTx = await CreditTransaction.findOne({
      userId: user._id,
      type: "DEDUCT",
      createdAt: { $gte: sub.startDate } // 🔥 KEY FIX
    });

    isUsed = !!usedTx;
  }

  return {
    status,
    statusText,
    isActive,
    expiryDate,

    duration,

    limits: {
      maxContacts,
      maxCheckins,
    },

    credits: {
      remaining: creditsRemaining, 
      total: totalCredits,  
      planCredits,
  topupCredits: totalCredits - planCredits,
  hasLowCredits,       
    },

    plan: {
      isUsed,
      daysLeft,
    }
  };
};