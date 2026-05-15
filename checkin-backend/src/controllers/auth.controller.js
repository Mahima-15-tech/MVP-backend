const User = require("../models/User");
const jwt = require("jsonwebtoken");
const PhoneRegistry = require("../models/PhoneRegistry");
const { formatPhone } = require("../../utils/phoneFormatter");
const getCountryRegion = require("../../utils/countryRegion");
const buildSubscriptionResponse = require("../../utils/buildSubscriptionResponse");
const Otp = require("../models/Otp");
const sendOtpMail = require("../../utils/otpMail"); 

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


exports.sendOtpMail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // 🔥 CHECK: email exists in DB or not
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Email not registered. Please sign up first."
      });
    }

    // 🔥 OPTIONAL: ensure email completed
    if (!user.emailCompleted) {
      return res.status(400).json({
        message: "Email not verified for this user"
      });
    }

    // 🔥 delete old OTP
    await Otp.deleteMany({ email });

    const otp = Math.floor(100000 + Math.random() * 900000);

    await Otp.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });

  await sendOtpMail(email, otp, user.name);({
      to: email,
      subject: "Your SOLO verification code",
      html: `
        <p>Hi ${user.name || "User"},</p>
    
        <p>Your verification code is:</p>
    
        <h2>${otp}</h2>
    
        <p>This code expires in 10 minutes</p>
    
        <p>If you did not request this code, please ignore this message</p>
    
        <p><strong>Team SOLO</strong></p>
      `
    });

    res.json({ message: "OTP sent to email" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const record = await Otp.findOne({ email, otp });

    if (!record) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (new Date() > record.expiresAt) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // 🔥 CHECK user must exist
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found"
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET
    );

    res.json({
      message: "Login successful",
      token,
      user
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyOtp = async (req, res) => {

  let { phone, countryCode, otp } = req.body;

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

  const user = await User.findOneAndUpdate(
    { phone: phoneNumber },
    { isVerified: true },
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
  status: isProfileComplete ? 2 : 1,
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
