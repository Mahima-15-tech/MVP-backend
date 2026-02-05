const User = require("../models/User");
const jwt = require("jsonwebtoken");

exports.sendOtp = async (req, res) => {
    console.log("BODY:", req.body);

  const { phone } = req.body;

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
};
