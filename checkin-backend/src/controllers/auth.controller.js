const User = require("../models/User");
const jwt = require("jsonwebtoken");
const PhoneRegistry = require("../models/PhoneRegistry");
const { formatPhone } = require("../../utils/phoneFormatter");

exports.sendOtp = async (req, res) => {

  let { phone } = req.body;

  const formattedPhone = formatPhone(phone);

  if (!formattedPhone) {
    return res.status(400).json({
      message: "Invalid phone number format"
    });
  }

  phone = formattedPhone;

  // Check registry
  let registry = await PhoneRegistry.findOne({ phone });

  if (registry && registry.isBanned) {
    return res.status(403).json({
      message: "Your account has been banned."
    });
  }

  if (!registry) {
    registry = await PhoneRegistry.create({ phone });
  }

  let user = await User.findOne({ phone });

  if (!user) {
    user = await User.create({ phone });
  }

  res.json({
    message: "OTP sent (dummy)",
    otp: "123456"
  });
};

exports.verifyOtp = async (req, res) => {

  let { phone, otp } = req.body;

  const formattedPhone = formatPhone(phone);

  if (!formattedPhone) {
    return res.status(400).json({
      message: "Invalid phone number"
    });
  }

  phone = formattedPhone;

  if (otp !== "123456") {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  const user = await User.findOneAndUpdate(
    { phone },
    { isVerified: true },
    { new: true }
  );

  if (!user) {
    return res.status(404).json({ message: "User not found" });
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

  res.json({ token, user });
};
