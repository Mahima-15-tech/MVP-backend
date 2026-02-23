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
            total: { $sum: "$amount" }
          }
        }
      ])
    ]);

    res.json({
      totalUsers,
      activeSubscriptions,
      alertsToday,
      failedSMS,
      retryInProgress,
      creditsUsedToday: creditsUsedToday[0]?.total || 0
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};