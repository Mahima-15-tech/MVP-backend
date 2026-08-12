const SMSLog = require("../../models/SMSLog");
const { getTwilioClient } = require("../../../utils/twilio");

exports.getSystemHealth = async (req, res) => {
  try {
    // ==============================
    // 1. SERVER STATUS
    // ==============================
    // Agar ye controller execute ho raha hai,
    // iska matlab backend server running hai.
    const serverStatus = "Running";

    // ==============================
    // 2. TWILIO STATUS
    // ==============================
    let smsStatus = "Offline";

    try {
      const twilioClient = await getTwilioClient();

      // Twilio account ko fetch karke actual connection verify karenge
      await twilioClient.api.v2010.accounts.list({
        limit: 1
      });

      smsStatus = "Online";
    } catch (twilioError) {
      console.log("❌ Twilio health check failed:", twilioError.message);
      smsStatus = "Offline";
    }

    // ==============================
    // 3. FAILED SMS - LAST 24 HOURS
    // ==============================
    const last24Hours = new Date(
      Date.now() - 24 * 60 * 60 * 1000
    );

    const failedSMS24h = await SMSLog.countDocuments({
      status: "FAILED",
      createdAt: {
        $gte: last24Hours
      }
    });

    // ==============================
    // RESPONSE
    // ==============================
    res.json({
      serverStatus,
      smsStatus,
      failedSMS24h
    });

  } catch (error) {
    console.error("❌ System health error:", error);

    res.status(500).json({
      message: error.message
    });
  }
};