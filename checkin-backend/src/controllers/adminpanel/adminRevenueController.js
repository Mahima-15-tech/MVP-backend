const SubscriptionHistory = require("../../models/SubscriptionHistory");
const AppSettings = require("../../models/AppSettings");



const PLAN_PRICE = {
  MONTHLY: 8,
  YEARLY: 50,
  TOPUP: 3,
  TRIAL: 0
};

const Transaction = require("../../models/Transaction");

exports.getRevenue = async (req, res) => {
  try {

    const { month, from, to } = req.query;

    let filter = {};

    const now = new Date();
    
    // ✅ PRIORITY 1 → CUSTOM DATE
    if (from && to) {
      filter.createdAt = {
        $gte: new Date(from),
        $lte: new Date(new Date(to).setHours(23, 59, 59, 999))
      };
    }
    
    // ✅ PRIORITY 2 → MONTH FILTER (ONLY IF NO CUSTOM DATE)
    else {
    
      if (month === "THIS_MONTH") {
        filter.createdAt = {
          $gte: new Date(now.getFullYear(), now.getMonth(), 1),
          $lte: now
        };
      }
    
      else if (month === "LAST_MONTH") {
        filter.createdAt = {
          $gte: new Date(now.getFullYear(), now.getMonth() - 1, 1),
          $lte: new Date(now.getFullYear(), now.getMonth(), 0)
        };
      }
    
      else if (month === "LAST_3") {
        filter.createdAt = {
          $gte: new Date(now.getFullYear(), now.getMonth() - 3, 1),
          $lte: now
        };
      }
    
      else if (month === "YTD") {
        filter.createdAt = {
          $gte: new Date(now.getFullYear(), 0, 1),
          $lte: now
        };
      }
    
    
    }

    const transactions = await Transaction.find(filter)
      .populate("userId")
      .sort({ createdAt: -1 });

    const data = transactions.map(t => ({
      date: t.createdAt,
      userId: t.userId?.phone || "-",
      userName: t.userId?.name || "-",
      plan: t.planType || t.type,
      gross: t.amount,
      net: t.net,
      fee: t.fee,
      status: t.status,
      paymentIntentId: t.stripePaymentIntentId,
      refundReason: t.refundRequestedReason || "-",
      refundStatus: t.refundStatus || "NONE",
      refundRequestedReason: t.refundRequestedReason 
    }));

    res.json(data);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



exports.getRevenueData = async () => {
  const settings = await AppSettings.findOne();
  const COMMISSION = (settings?.commission || 15) / 100;

  const records = await SubscriptionHistory.find();

  let monthlyGross = 0;
  let yearlyGross = 0;
  let topupGross = 0;

  records.forEach(r => {
    if (r.newPlan === "MONTHLY") monthlyGross += 8;
    if (r.newPlan === "YEARLY") yearlyGross += 50;
    if (r.newPlan === "TOPUP") topupGross += 3;
  });

  return {
    monthly: {
      gross: monthlyGross,
      net: +(monthlyGross * (1 - COMMISSION)).toFixed(2)
    },
    yearly: {
      gross: yearlyGross,
      net: +(yearlyGross * (1 - COMMISSION)).toFixed(2)
    },
    topups: {
      gross: topupGross,
      net: +(topupGross * (1 - COMMISSION)).toFixed(2)
    }
  };
};

exports.getUserTransactions = async (req, res) => {
  try {

    const { userId } = req.params;

    const txns = await Transaction.find({ userId })
      .sort({ createdAt: -1 });

    res.json(txns);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// adminRevenueController.js ya alag controller

exports.getRefundHistory = async (req, res) => {
  try {

    const data = await Transaction.find({
      refundRequestedReason: { $exists: true, $ne: "" }
    }).populate("userId");

    res.json(data.map(t => ({
      date: t.createdAt,
      userName: t.userId?.name || "-",
      userPhone: t.userId?.phone || "-",
      plan: t.planType,
      amount: t.amount,
      refundRequestedReason: t.refundRequestedReason,
      status: t.refundStatus
    })));

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};