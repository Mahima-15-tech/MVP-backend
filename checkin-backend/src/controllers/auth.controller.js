const User = require("../models/User");
const jwt = require("jsonwebtoken");
const PhoneRegistry = require("../models/PhoneRegistry");
const { formatPhone } = require("../../utils/phoneFormatter");
const getCountryRegion = require("../../utils/countryRegion");
const buildSubscriptionResponse = require("../../utils/buildSubscriptionResponse");
const Otp = require("../models/Otp");
const sendOtpMail = require("../../utils/otpMail"); 
const stripe = require("../config/stripe");

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

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Email not registered",
      });
    }

    if (!user.emailCompleted) {
      return res.status(400).json({
        message: "Email not verified",
      });
    }

    await Otp.deleteMany({ email });

    const otp = Math.floor(100000 + Math.random() * 900000);

    await Otp.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    console.log("📨 Sending OTP to:", email);

    // ✅ FINAL CALL
    await sendOtpMail(email, otp, user.name);

    res.json({ message: "OTP sent successfully" });

  } catch (error) {
    console.error("❌ API ERROR:", error);
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
  
  // 🔥 STRIPE CUSTOMER CREATE
  if (!user.stripeCustomerId) {
    const customer = await stripe.customers.create({
      phone: user.phone,
      email: user.email || undefined
    });
  
    user.stripeCustomerId = customer.id;
    await user.save();
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
