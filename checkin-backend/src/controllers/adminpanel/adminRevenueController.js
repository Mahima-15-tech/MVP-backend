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

    let totalGross = 0;
let totalNet = 0;
let totalFee = 0;



    const { month, from, to } = req.query;

    let filter = {};

    const now = new Date();
    
    // ✅ PRIORITY 1 → CUSTOM DATE
    if (from && to && month === "CUSTOM") {

      const fromDate = new Date(from);
      fromDate.setHours(0, 0, 0, 0);   // ✅ start of day
    
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999); // ✅ end of day

      console.log("FROM DATE:", fromDate);   // 👈 ADD HERE
  console.log("TO DATE:", toDate);    

    
      filter.createdAt = {
        $gte: fromDate,
        $lte: toDate
      };
      console.log("FILTER:", filter);
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

    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;
    
    const transactions = await Transaction.find(filter)
      .populate("userId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

      console.log("TRANSACTION RAW 👉", transactions);
    
    const total = await Transaction.countDocuments(filter);

      const data = transactions.map(t => {

        totalGross += t.amount || 0;
        totalNet += t.net || 0;
        totalFee += t.fee || 0;
      
        return {
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
        };
      });

      res.json({
        data,
        totalPages: Math.ceil(total / limit),
        page,
        summary: {
          gross: totalGross,
          net: totalNet,
          fee: totalFee
        },
        totalCount: total
      });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};





exports.getRevenueData = async () => {

  const now = new Date();

  // ✅ start of current month
  const startOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
    0, 0, 0, 0
  );

  const transactions = await Transaction.find({
    createdAt: { $gte: startOfMonth, $lte: now },
    status: "SUCCESS"
  });

  let monthly = { gross: 0, net: 0, fee: 0 };
  let yearly = { gross: 0, net: 0, fee: 0 };
  let topups = { gross: 0, net: 0, fee: 0 };

  transactions.forEach(t => {

    const target =
      t.planType === "MONTHLY"
        ? monthly
        : t.planType === "YEARLY"
        ? yearly
        : topups;

    target.gross += t.amount || 0;
    target.net += t.net || 0;
    target.fee += t.fee || 0;

  });

  return {
    monthly,
    yearly,
    topups
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