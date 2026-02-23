const User = require("../../models/User");
const CheckinSchedule = require("../../models/CheckinSchedule");
const Alert = require("../../models/Alert");
const PhoneRegistry = require("../../models/PhoneRegistry");


exports.getDashboardStats = async (req, res) => {
  const totalUsers = await User.countDocuments();
  const activeCheckins = await CheckinSchedule.countDocuments({ status: "ACTIVE" });
  const pausedCheckins = await CheckinSchedule.countDocuments({ status: "PAUSED" });
  const alertsToday = await Alert.countDocuments({
    createdAt: { $gte: new Date().setHours(0, 0, 0, 0) },
  });

  res.json({
    totalUsers,
    activeCheckins,
    pausedCheckins,
    alertsToday,
  });
};

exports.getUsers = async (req, res) => {
  const users = await User.find()
    .select("name phone language alertVoice lastKnownLocation createdAt");

  res.json(users);
};

exports.getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find()
      .populate("userId", "name phone lastKnownLocation")
      .sort({ createdAt: -1 });

    res.json(alerts);
  } catch (error) {
    console.error("Get alerts error:", error);
    res.status(500).json({ message: "Failed to fetch alerts" });
  }
};
    

exports.getCheckinLogs = async (req, res) => {
  try {
    const logs = await CheckinSchedule.find()
      .populate("userId", "name phone")
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (error) {
    console.error("Get check-in logs error:", error);
    res.status(500).json({ message: "Failed to fetch check-in logs" });
  }
};


exports.banUser = async (req, res) => {
  const { userId } = req.params;
  const { reason } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  await User.findByIdAndUpdate(userId, {
    isBanned: true,
    banReason: reason || "Policy violation"
  });

  await PhoneRegistry.findOneAndUpdate(
    { phone: user.phone },
    { isBanned: true }
  );

  res.json({ message: "User banned successfully" });
};

exports.unbanUser = async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  await User.findByIdAndUpdate(userId, {
    isBanned: false,
    banReason: null
  });

  await PhoneRegistry.findOneAndUpdate(
    { phone: user.phone },
    { isBanned: false }
  );

  res.json({ message: "User unbanned successfully" });
};