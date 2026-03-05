const bcrypt = require("bcryptjs");
const { sendSMS } = require("../../services/smsService");
const Admin = require("../../models/Admin");

exports.forgotPassword = async (req, res) => {
  try {

    const { phone } = req.body;

    const admin = await Admin.findOne({ phone });

    // Always generic response
    if (!admin) {
      return res.json({
        message: "If account exists, OTP has been sent."
      });
    }

    // Block check
    if (
      admin.resetOtpBlockedUntil &&
      admin.resetOtpBlockedUntil > Date.now()
    ) {
      return res.status(429).json({
        message: "Too many attempts. Try again later."
      });
    }

    // Cooldown 60 seconds
    if (
      admin.lastOtpSentAt &&
      Date.now() - admin.lastOtpSentAt < 60000
    ) {
      return res.status(429).json({
        message: "Please wait before requesting again."
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const hashedOtp = await bcrypt.hash(otp, 10);

    admin.resetOtp = hashedOtp;
    admin.resetOtpExpires = Date.now() + 5 * 60 * 1000;
    admin.lastOtpSentAt = Date.now();

    await admin.save();

    await sendSMS(admin.phone, `Your reset OTP is ${otp}`);

    res.json({
      message: "If account exists, OTP has been sent."
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



