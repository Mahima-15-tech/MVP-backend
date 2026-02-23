const Alert = require("../models/Alert");
const EmergencyContact = require("../models/EmergencyContact");
const User = require("../models/User");


// Latest alert with contacts + location
exports.getLatestAlert = async (req, res) => {
  const alert = await Alert.findOne({
    userId: req.user.userId,
  }).sort({ createdAt: -1 });

  if (!alert) {
    return res.json({ message: "No alerts found" });
  }

  const user = await User.findById(req.user.userId);

  const contacts = await EmergencyContact.find({
    userId: req.user.userId,
  });

  res.json({
    alert,
    location: user.lastKnownLocation || null,
    contacts,
  });
};

exports.getAlertHistory = async (req, res) => {
  try {

    const userId = req.user.userId;

    const alerts = await Alert.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50); // pagination later

    res.json(alerts);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
