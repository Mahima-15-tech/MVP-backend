const User = require("../models/User");
const EmergencyContact = require("../models/EmergencyContact");
const CheckinSchedule = require("../models/CheckinSchedule");
const Alert = require("../models/Alert");
const Subscription = require("../models/subscription");
const CreditTransaction = require("../models/creditTransaction");
const PushLog = require("../models/PushLog"); // if exists
const SmsConsent = require("../models/SmsConsent");
const buildSubscriptionResponse = require("../../utils/buildSubscriptionResponse");


// 1️⃣ Update profile (name)


exports.updateProfile = async (req, res) => {
  try {

    const userId = req.user.userId;

    const {
      name,
      age,
      gender,
      email,
      profileLocation
    } = req.body;

    const updateData = {};

    // current user fetch
    const user = await User.findById(userId);

    /* -------- NAME -------- */

    if (name !== undefined) {

      if (name.trim().length < 2) {
        return res.status(400).json({
          message: "Name must be at least 2 characters"
        });
      }

      updateData.name = name;
      updateData.nameCompleted = true;
    }

    /* -------- AGE -------- */

    if (age !== undefined) {

      if (age < 0 || age > 120) {
        return res.status(400).json({
          message: "Invalid age"
        });
      }

      updateData.age = age;
    }

    /* -------- GENDER -------- */

    if (gender !== undefined) {

      const allowed = ["Male", "Female", "Other"];

      if (!allowed.includes(gender)) {
        return res.status(400).json({
          message: "Invalid gender"
        });
      }

      updateData.gender = gender;
    }

    /* -------- EMAIL -------- */

    if (email !== undefined) {

      // agar email change hua hai tab hi check karo
      if (user.email !== email) {

        const existingEmail = await User.findOne({ email });

        if (existingEmail) {
          return res.status(400).json({
            message: "Email already exists"
          });
        }

      }

      updateData.email = email;
      updateData.emailCompleted = true;
    }

    /* -------- LOCATION -------- */

    if (profileLocation !== undefined) {
      updateData.profileLocation = profileLocation;
    }

    /* -------- PROFILE IMAGE -------- */

    if (req.file) {
      updateData.profileImage = `/uploads/profile/${req.file.filename}`;
    }

    /* -------- UPDATE USER -------- */

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    );

    res.json({
      message: "Profile updated successfully",
      user: updatedUser
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.updateProfileImage = async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({
        message: "Image required"
      });
    }

    const imageUrl = `/uploads/profile/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { profileImage: imageUrl },
      { new: true }
    );

    res.json({
      message: "Profile image updated",
      profileImage: imageUrl,
      user
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
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
  const subscription = await buildSubscriptionResponse(user);

res.json({
  status: 1,
  user: {
    ...user.toObject(),
    subscription
  }
});
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

    await User.findByIdAndUpdate(req.user.userId, {
      fcmToken: devicetoken,
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




exports.saveToken = async (req, res) => {
  try {
    const { token } = req.body;

    console.log("TOKEN:", token);
    console.log("USER FROM REQ:", req.user);

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { fcmToken: token },
      { new: true }   // 👈 IMPORTANT
    );

    console.log("UPDATED USER:", updatedUser);

    res.json({ success: true, updatedUser });

  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).json({ error: "Failed" });
  }
};


