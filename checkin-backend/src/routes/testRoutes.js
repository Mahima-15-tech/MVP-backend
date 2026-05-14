const express = require("express");
const router = express.Router();
const { sendSMS } = require("../services/smsService");

router.get("/test-sms", async (req, res) => {
  try {
    await sendSMS({
      userId: "64a1f2c9b5e8a123456789ab", // koi bhi dummy
      recipientName: "Test",
      recipientNumber: "+6590997906", // apna number
      message: "🚀 Twilio test successful",
      type: "OTP"
    });

    res.send("SMS sent!");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;