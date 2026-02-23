const User = require("../../models/User");
const Subscription = require("../../models/subscription");
const Alert = require("../../models/Alert");
const CreditTransaction = require("../../models/creditTransaction");
const CheckinSchedule = require("../../models/CheckinSchedule");
const EmergencyContact = require("../../models/EmergencyContact");

exports.getUserDetail = async (req, res) => {
  try {

    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const subscription = await Subscription.findOne({ userId });

    const latestCredit = await CreditTransaction
      .findOne({ userId })
      .sort({ createdAt: -1 });

    const creditHistory = await CreditTransaction
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    const checkin = await CheckinSchedule.findOne({ userId });

    const alerts = await Alert
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(5);

    const contacts = await EmergencyContact.find({ userId });

    res.json({
      basicInfo: user,
      subscription,
      currentBalance: latestCredit?.balanceAfter || 0,
      creditHistory,
      checkin,
      recentAlerts: alerts,
      contacts,
      contactsCount: contacts.length
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};