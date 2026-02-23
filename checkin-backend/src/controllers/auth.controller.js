const User = require("../models/User");
const jwt = require("jsonwebtoken");
const PhoneRegistry = require("../models/PhoneRegistry");

exports.sendOtp = async (req, res) => {
  const { phone } = req.body;

  // 1️⃣ Check registry
  let registry = await PhoneRegistry.findOne({ phone });

  if (registry && registry.isBanned) {
    return res.status(403).json({
      message: "Your account has been banned."
    });
  }

  // 2️⃣ If registry not exist → create
  if (!registry) {
    registry = await PhoneRegistry.create({ phone });
  }

  // 3️⃣ Create user only if not exists
  let user = await User.findOne({ phone });
  if (!user) {
    user = await User.create({ phone });
  }

  res.json({
    message: "OTP sent (dummy)",
    otp: "123456",
  });
};


exports.verifyOtp = async (req, res) => {
  const { phone, otp } = req.body;

  if (otp !== "123456") {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  // 1️⃣ Check registry
  const registry = await PhoneRegistry.findOne({ phone });

  if (registry && registry.isBanned) {
    return res.status(403).json({
      message: "Your account has been banned."
    });
  }

  const user = await User.findOneAndUpdate(
    { phone },
    { isVerified: true },
    { new: true }
  );



  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET
  );


  res.json({ token, user });

  if (user.isBanned) {
    return res.status(403).json({
      message: "Your account has been banned.",
      reason: user.banReason
    });
  }
};
