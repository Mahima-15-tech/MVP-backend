const { sendSMS } = require("./smsService");
const OTP = require("../models/OTP");

exports.sendOTP = async (user, phone) => {

  const otp = Math.floor(100000 + Math.random() * 900000);

  await OTP.create({
    userId: user._id,
    otp,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000)
  });

  await sendSMS(phone, `Your OTP is ${otp}`);

  return true;
};