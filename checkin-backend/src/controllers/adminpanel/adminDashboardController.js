const User = require("../../models/User");
const Subscription = require("../../models/subscription");
const Alert = require("../../models/Alert");
const CreditTransaction = require("../../models/creditTransaction");

exports.getDashboardSummary = async (req, res) => {
  try {


    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);

    const [
      totalUsers, 
      activeSubscriptions,
      alertsToday,
      failedSMS,
      retryInProgress,
      creditsUsedToday
    ] = await Promise.all([

      User.countDocuments(),

      Subscription.countDocuments({ status: "ACTIVE" }),

      Alert.countDocuments({ createdAt: { $gte: todayStart } }),

      Alert.countDocuments({ status: "FAILED" }),

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
      ])
    ]);

    const [missedToday, sosToday] = await Promise.all([
      Alert.countDocuments({
        type: "MISSED_CHECKIN",
        createdAt: { $gte: todayStart }
      }),
      Alert.countDocuments({
        type: "SOS",
        createdAt: { $gte: todayStart }
      })
    ]);

   // Plan distribution (ACTIVE only)
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
  if (plan._id === "TRIAL") {
    freeTrialUsers = plan.count;
  }
  if (plan._id === "MONTHLY") {
    monthlyUsers = plan.count;
  }
  if (plan._id === "YEARLY") {
    yearlyUsers = plan.count;
  }
});
    res.json({
      totalUsers,
      activeSubscriptions,
      alertsToday,
      failedSMS,
      retryInProgress,
      missedToday,
      freeTrialUsers,
monthlyUsers,
yearlyUsers,
sosToday,
      creditsUsedToday: creditsUsedToday[0]?.total || 0
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

