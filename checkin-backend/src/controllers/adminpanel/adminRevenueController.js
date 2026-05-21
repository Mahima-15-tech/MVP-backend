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

    // DATE FILTER
    if (from && to) {
      filter.createdAt = {
        $gte: new Date(from),
        $lte: new Date(new Date(to).setHours(23,59,59,999))
      };
    }

    const transactions = await Transaction.find(filter)
      .populate("userId")
      .sort({ createdAt: -1 });

    const data = transactions.map(t => ({
      date: t.createdAt,
      userId: t.userId?.phone || "-",
      userName: t.userId?.name || "-",
      plan: t.type,
      gross: t.amount,
      net: t.net,
      fee: t.fee,
      status: t.status,
      paymentIntentId: t.stripePaymentIntentId
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