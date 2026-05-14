const express = require("express");
const router = express.Router();
const {
  sendOtp,
  verifyOtp,
  sendEmailOtp,
  verifyEmailOtp
} = require("../controllers/auth.controller");

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/send-email-otp", sendEmailOtp);
router.post("/verify-email-otp", verifyEmailOtp);

module.exports = router;
