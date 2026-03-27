const User = require("../models/User");
const jwt = require("jsonwebtoken");
const PhoneRegistry = require("../models/PhoneRegistry");
const { formatPhone } = require("../../utils/phoneFormatter");
const getCountryRegion = require("../../utils/countryRegion");
const buildSubscriptionResponse = require("../../utils/buildSubscriptionResponse");


exports.sendOtp = async (req, res) => {

  let { phone, countryCode } = req.body;

  // basic validation
  if (!phone || !countryCode) {
    return res.status(400).json({
      message: "Phone and country code are required"
    });
  }

  const formattedPhone = formatPhone(countryCode, phone);

  if (!formattedPhone) {
    return res.status(400).json({
      message: "Invalid phone number"
    });
  }

  const phoneNumber = formattedPhone;

  let registry = await PhoneRegistry.findOne({ phone: phoneNumber });

  if (registry && registry.isBanned) {
    return res.status(403).json({
      message: "Your account has been banned."
    });
  }

  if (!registry) {
    registry = await PhoneRegistry.create({ phone: phoneNumber });
  }

  let user = await User.findOne({ phone: phoneNumber });

  if (!user) {

    const { country, region } = getCountryRegion(phoneNumber);
  
    user = await User.create({
      phone: phoneNumber,
      country,
      region
    });
  
  }

  res.json({
    message: "OTP sent (dummy)",
    otp: "123456"
  });
};


exports.verifyOtp = async (req, res) => {

  let { phone, countryCode, otp, language  } = req.body;

  if (!phone || !countryCode) {
    return res.status(400).json({
      message: "Phone and country code are required"
    });
  }

  const formattedPhone = formatPhone(countryCode, phone);

  if (!formattedPhone) {
    return res.status(400).json({
      message: "Invalid phone number"
    });
  }

  const phoneNumber = formattedPhone;

  if (otp !== "123456") {
    return res.status(400).json({
      message: "Invalid OTP"
    });
  }

  const updateData = {
    isVerified: true
  };
  
  if (language) {
    updateData.language = language; // 🔥 NEW
  }
  
  const user = await User.findOneAndUpdate(
    { phone: phoneNumber },
    updateData,
    { new: true }
  );

  if (!user) {
    return res.status(404).json({
      message: "User not found"
    });
  }

  if (user.isBanned) {
    return res.status(403).json({
      message: "Your account has been banned.",
      reason: user.banReason
    });
  }

  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET
  );

  const subscription = await buildSubscriptionResponse(user);

  const isProfileComplete =
  user.emailCompleted && user.nameCompleted;

res.json({
  status: isProfileComplete ? 2 : 1, // 🔥 MAIN FIX
  token,
  onboarding: {
    emailCompleted: user.emailCompleted,
    nameCompleted: user.nameCompleted
  },
  user: {
    ...user.toObject(),
    subscription
  }
});

};
