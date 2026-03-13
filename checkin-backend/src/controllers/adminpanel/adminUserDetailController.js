const User = require("../../models/User");
const Subscription = require("../../models/subscription");
const Alert = require("../../models/Alert");
const CreditTransaction = require("../../models/creditTransaction");
const CheckinSchedule = require("../../models/CheckinSchedule");
const EmergencyContact = require("../../models/EmergencyContact");
const AdminNote = require("../../models/AdminNote");
const SubscriptionHistory = require("../../models/SubscriptionHistory");
const ContactHistory = require("../../models/ContactHistory");

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
    
    
      const adminNotes = await AdminNote
      .find({ userId })
      .populate("adminId", "name email")
      .sort({ createdAt: -1 });

      const subscriptionHistory = await SubscriptionHistory
  .find({ userId })
  .sort({ createdAt: -1 });

    const contacts = await EmergencyContact.find({ userId });

    const contactHistory = await ContactHistory
    .find({ userId })
    .sort({ createdAt: -1 });


    res.json({
      basicInfo: user,
      subscription,
      currentBalance: latestCredit?.balanceAfter || 0,
      creditHistory,
      checkin,
      recentAlerts: alerts,
      adminNotes,
      subscriptionHistory,
      contacts,
      contactHistory,
      contactsCount: contacts.length
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.addAdminNote = async (req, res) => {
  try {
    const { userId } = req.params;
    const { note } = req.body;

    const newNote = await AdminNote.create({
      userId,
      adminId: req.admin.adminId,
      note
    });

    res.json({ message: "Note added", newNote });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.adjustUserCredits = async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount, reason } = req.body;

    if (!amount) {
      return res.status(400).json({ message: "Amount required" });
    }

    const latest = await CreditTransaction
      .findOne({ userId })
      .sort({ createdAt: -1 });

    const currentBalance = latest?.balanceAfter || 0;

    const newBalance = currentBalance + amount;

    if (newBalance < 0) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const transaction = await CreditTransaction.create({
      userId,
      type: amount > 0 ? "ADD" : "DEDUCT",
      reason: reason || "ADMIN_ADJUSTMENT",
      amount: Math.abs(amount),
      balanceAfter: newBalance,
      adminId: req.admin.adminId,
    });

    res.json({
      message: "Credits adjusted successfully",
      transaction
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.toggleUserCheckin = async (req, res) => {
  try {
    const { userId } = req.params;

    const schedule = await CheckinSchedule.findOne({ userId });

    if (!schedule) {
      return res.status(404).json({ message: "Check-in schedule not found" });
    }

    if (schedule.status === "PAUSED") {
      schedule.status = "ACTIVE";
      schedule.lastCheckInAt = null;   // 🔥 VERY IMPORTANT
    } else {
      schedule.status = "PAUSED";
    }

    await schedule.save();

    res.json({
      message: "Check-in status updated",
      status: schedule.status
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getUsersDashboard = async (req, res) => {
  try {

    const totalUsers = await User.countDocuments();

    const trialUsers = await Subscription.countDocuments({
      planType: "TRIAL"
    });

    const activeSubscribers = await Subscription.countDocuments({
      status: "ACTIVE"
    });

    const expiredCancelled = await Subscription.countDocuments({
      status: { $in: ["EXPIRED", "CANCELLED"] }
    });

    const bannedUsers = await User.countDocuments({
      isBanned: true
    });

    const pendingVerification = await User.countDocuments({
      isVerified: false
    });

    const contactsAgg = await EmergencyContact.aggregate([
      { $group: { _id: "$userId" } }
    ]);

    const usersWithContacts = contactsAgg.map(c => c._id);

    const noContacts = await User.countDocuments({
      _id: { $nin: usersWithContacts }
    });

    const latestCredits = await CreditTransaction.aggregate([
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: "$userId",
          balance: { $first: "$balanceAfter" }
        }
      }
    ]);

    const lowCredits = latestCredits.filter(c => c.balance < 2).length;

    res.json({
      totalUsers,
      trialUsers,
      activeSubscribers,
      expiredCancelled,
      bannedUsers,
      pendingVerification,
      noContacts,
      lowCredits
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUsersByRegion = async (req, res) => {
  try {

    const regions = await User.aggregate([
      {
        $group: {
          _id: "$region",
          count: { $sum: 1 }
        }
      }
    ]);

    const result = {
      APAC: 0,
      EMEA: 0,
      LATAM: 0,
      OTHER: 0
    };

    regions.forEach(r => {
      if (result[r._id] !== undefined) {
        result[r._id] = r.count;
      } else {
        result.OTHER += r.count;
      }
    });

    res.json(result);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTopCountries = async (req, res) => {
  try {

    const countries = await User.aggregate([
      {
        $group: {
          _id: "$country",
          users: { $sum: 1 }
        }
      },
      {
        $sort: { users: -1 }
      },
      {
        $limit: 5
      }
    ]);

    const formatted = countries.map(c => ({
      country: c._id,
      users: c.users
    }));

    res.json(formatted);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {

    const users = await User.find()
      .sort({ createdAt: -1 })
      .lean();

    const subscriptions = await Subscription.find();

    const credits = await CreditTransaction.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$userId",
          balance: { $first: "$balanceAfter" }
        }
      }
    ]);

    const creditMap = {};
    credits.forEach(c => {
      creditMap[c._id] = c.balance;
    });

    const result = users.map(u => ({
      ...u,
      currentBalance: creditMap[u._id] || 0
    }));

    res.json(result);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};