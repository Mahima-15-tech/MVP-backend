const User = require("../../models/User");
const Subscription = require("../../models/subscription");
const Alert = require("../../models/Alert");
const CreditTransaction = require("../../models/creditTransaction");
const { getRevenueData } = require("./adminRevenueController");

exports.getDashboardSummary = async (req, res) => {
  try {

    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);

    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [
      totalUsers, 
      activeSubscriptions,
      alertsToday,
      failedSMS,
      retryInProgress,
      creditsUsedToday,
      smsConfirmed
    ] = await Promise.all([

      User.countDocuments(),

      Subscription.countDocuments({ status: "ACTIVE" }),

      Alert.countDocuments({ createdAt: { $gte: todayStart } }),

      // ✅ FIXED (24h)
      Alert.countDocuments({
        status: "FAILED",
        createdAt: { $gte: last24h }
      }),

      Alert.countDocuments({ status: "SMS_PENDING" }),

      CreditTransaction.aggregate([
        {
          $match: {
            type: "DEDUCT",
            createdAt: { $gte: todayStart }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $abs: "$amount" } }
          }
        }
      ]),

      // ✅ NEW
      Alert.countDocuments({ status: "SUCCESS" })

    ]);

    const now = new Date();

    const [missedToday, sosToday] = await Promise.all([

      Alert.countDocuments({
        type: { $in: ["MISSED_CHECKIN", "MISSED"] },
        createdAt: { $gte: todayStart, $lte: now }
      }),
    
      Alert.countDocuments({
        type: { $in: ["SOS", "SOS_ALERT"] },
        createdAt: { $gte: todayStart, $lte: now }
      })
    
    ]);
    /* ================= PLAN DISTRIBUTION ================= */

    const planCounts = await Subscription.aggregate([
      { $match: { status: "ACTIVE" } },
      {
        $group: {
          _id: "$planType",
          count: { $sum: 1 }
        }
      }
    ]);

    let freeTrialUsers = 0;
    let monthlyUsers = 0;
    let yearlyUsers = 0;

    planCounts.forEach(plan => {
      if (plan._id === "TRIAL") freeTrialUsers = plan.count;
      if (plan._id === "MONTHLY") monthlyUsers = plan.count;
      if (plan._id === "YEARLY") yearlyUsers = plan.count;
    });

    /* ================= REVENUE ================= */

    const revenueData = await getRevenueData();

    res.json({
      totalUsers,
      activeSubscriptions,
      alertsToday,
      failedSMS,
      retryInProgress,
      missedToday,
      sosToday,
      smsConfirmed,

      freeTrialUsers,
      monthlyUsers,
      yearlyUsers,

      creditsUsedToday: creditsUsedToday[0]?.total || 0,

      revenue: revenueData
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


