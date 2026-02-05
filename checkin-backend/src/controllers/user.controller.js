const User = require("../models/User");
const EmergencyContact = require("../models/EmergencyContact");
const CheckinSchedule = require("../models/CheckinSchedule");
const Alert = require("../models/Alert");

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


exports.deleteAccount = async (req, res) => {
  const userId = req.user.userId;

  // 1️⃣ Delete related data
  await EmergencyContact.deleteMany({ userId });
  await CheckinSchedule.deleteMany({ userId });
  await Alert.deleteMany({ userId });

  // 2️⃣ Delete user
  await User.findByIdAndDelete(userId);

  res.json({
    message: "Account deleted successfully",
  });
};