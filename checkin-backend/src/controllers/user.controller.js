const User = require("../models/User");
const EmergencyContact = require("../models/EmergencyContact");
const CheckinSchedule = require("../models/CheckinSchedule");
const Alert = require("../models/Alert");
const Subscription = require("../models/subscription");
const CreditTransaction = require("../models/creditTransaction");
const PushLog = require("../models/PushLog"); // if exists
const SmsConsent = require("../models/SmsConsent");



// 1️⃣ Update profile (name)


exports.updateProfile = async (req, res) => {
  const {
    name,
    age,
    gender,
    email,
    profileLocation,
  } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user.userId,
    {
      $set: {
        ...(name && { name }),
        ...(age !== undefined && { age }),
        ...(gender && { gender }),
        ...(email && { email }),
        ...(profileLocation && { profileLocation }),
      },
    },
    { new: true }
  );

  res.json({
    message: "Profile updated",
    user,
  });
};


exports.saveEmail = async (req, res) => {
  try {

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required"
      });
    }

    const existingEmail = await User.findOne({ email });

    if (existingEmail && existingEmail._id.toString() !== req.user.userId) {
      return res.json({
        status: 2,
        message: "Email already exists"
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        email,
        emailCompleted: true
      },
      { new: true }
    );

    res.json({
      status: 1,
      message: "Email saved successfully",
      onboarding: {
        emailCompleted: user.emailCompleted,
        nameCompleted: user.nameCompleted
      },
      user
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.saveName = async (req, res) => {
  try {

    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Name is required"
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        name,
        nameCompleted: true
      },
      { new: true }
    );

    res.json({
      status: 1,
      message: "Name saved successfully",
      onboarding: {
        emailCompleted: user.emailCompleted,
        nameCompleted: user.nameCompleted
      },
      user
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2️⃣ Update preferences (language + voice)
exports.updatePreferences = async (req, res) => {
  const { language, alertVoice } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user.userId,
    { language, alertVoice },
    { new: true }
  );

  res.json({
    message: "Preferences updated",
    user,
  });
};

// 3️⃣ Get profile
exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user.userId);
  res.json(user);
};

// 4️⃣ Update last known location
exports.updateLocation = async (req, res) => {
  const { lat, lng } = req.body;

  if (lat == null || lng == null) {
    return res.status(400).json({ message: "lat and lng are required" });
  }

  await User.findByIdAndUpdate(req.user.userId, {
    lastKnownLocation: {
      lat,
      lng,
      updatedAt: new Date(),
    },
  });

  res.json({ message: "Location updated" });
};

exports.saveDeviceToken = async (req, res) => {
  try {

    const userId = req.user.userId;
    const { deviceToken } = req.body;

    if (!deviceToken) {
      return res.status(400).json({ message: "Device token required" });
    }

    await User.findByIdAndUpdate(userId, {
      deviceToken
    });

    res.json({ message: "Device token saved" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.updateSmsConsent = async (req, res) => {
  try {

    const userId = req.user.userId;
    const { consent } = req.body;

    let record = await SmsConsent.findOne({ userId });

    if (!record) {
      record = await SmsConsent.create({
        userId,
        consentGiven: consent,
        consentGivenAt: consent ? new Date() : null,
        consentRevokedAt: !consent ? new Date() : null
      });
    } else {
      record.consentGiven = consent;
      record.consentGivenAt = consent ? new Date() : record.consentGivenAt;
      record.consentRevokedAt = !consent ? new Date() : null;
      await record.save();
    }

    res.json({ message: "SMS consent updated" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.logoutUser = async (req, res) => {
  await User.findByIdAndUpdate(req.user.userId, {
    deviceToken: null
  });

  res.json({ message: "Logged out successfully" });
};


exports.deleteAccount = async (req, res) => {
  try {

    const userId = req.user.userId;

    // 1️⃣ Delete related data
    await EmergencyContact.deleteMany({ userId });
    await CheckinSchedule.deleteMany({ userId });
    await Alert.deleteMany({ userId });
    await Subscription.deleteMany({ userId });
    await CreditTransaction.deleteMany({ userId });
    await PushLog.deleteMany({ userId }); // optional

    // 2️⃣ Delete user
    await User.findByIdAndDelete(userId);

    res.json({
      message: "Account deleted permanently",
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

