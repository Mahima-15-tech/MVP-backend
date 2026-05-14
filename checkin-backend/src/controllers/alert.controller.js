const Alert = require("../models/Alert");
const EmergencyContact = require("../models/EmergencyContact");
const User = require("../models/User");
const Checkin = require("../models/CheckinSchedule");


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

exports.initSOS = async (req, res) => {
  try {
    const userId = req.user.userId;

    // 🔥 cleanup expired
    await Alert.deleteMany({
      userId,
      status: "CREATED",
      expiresAt: { $lt: new Date() }
    });

    // 🔥 only active check
    const existing = await Alert.findOne({
      userId,
      status: "CREATED",
      type: "SOS",
      expiresAt: { $gt: new Date() }
    });

    if (existing) {
      return res.json({
        message: "SOS already initiated",
        alert: existing
      });
    }

    const alert = await Alert.create({
      userId,
      type: "SOS",
      status: "CREATED",
      expiresAt: new Date(Date.now() + 20 * 1000)
    });

    res.json({
      message: "SOS initiated",
      alertId: alert._id,
      expiresIn: 20
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.confirmSOS = async (req, res) => {
  try {
    const userId = req.user.userId;

    const alert = await Alert.findOne({
      userId,
      type: "SOS",
      status: "CREATED"
    }).sort({ createdAt: -1 });

    if (!alert) {
      return res.status(400).json({
        message: "No active SOS to confirm"
      });
    }
    
    
    if (alert.expiresAt && new Date() > alert.expiresAt) {
      return res.status(400).json({
        message: "SOS expired, please try again"
      });
    }
    const user = await User.findById(userId);

    const contacts = await EmergencyContact.find({ userId });

    if (!contacts.length) {
      return res.status(400).json({
        message: "No emergency contacts found"
      });
    }

    // ✅ FINAL TRIGGER
    alert.status = "SMS_PENDING";
    alert.location = user.lastKnownLocation || null;
    await alert.save();

    // pause checkin
    await Checkin.updateOne(
      { userId },
      { status: "PAUSED" }
    );

    console.log("🚨 SOS CONFIRMED:", alert._id);

    res.json({
      message: "SOS alert sent",
      alert
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.cancelSOS = async (req, res) => {
  await Alert.deleteOne({
    userId: req.user.userId,
    type: "SOS",
    status: "CREATED"
  });

  res.json({ message: "SOS cancelled" });
};

exports.triggerSOS = async (req, res) => {

  try {
 
   const userId = req.user.userId;
 
   const user = await User.findById(userId);
 
   const contacts = await EmergencyContact.find({
    userId
   });
 
   if (!contacts.length) {
    return res.status(400).json({
     message: "No emergency contacts found"
    });
   }
 
   const alert = await Alert.create({
    userId,
    type: "SOS",
    language: user.language,
    alertVoice: user.alertVoice,
    location: user.lastKnownLocation || null,
    creditsUsed: 1,
    status: "SMS_PENDING",
    retryCount: 0
   });
 
   // pause checkin
   await Checkin.updateOne(
    { userId },
    { status: "PAUSED" }
   );
 
   console.log("🚨 SOS alert created:", alert._id);
 
   res.json({
    message: "SOS alert triggered",
    alert
   });
 
  } catch (error) {
 
   res.status(500).json({
    message: error.message
   });
 
  }
 
 };