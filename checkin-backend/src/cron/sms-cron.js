const cron = require("node-cron");
const Alert = require("../models/Alert");
const EmergencyContact = require("../models/EmergencyContact");
const SmsConsent = require("../models/SmsConsent");
const SMSLog = require("../models/SMSLog");
const { sendSMS } = require("../services/smsService");

console.log("🟢 SMS cron loaded");

cron.schedule("*/2 * * * *", async () => {
  console.log("📲 Running SMS retry engine");

  try {
    const now = new Date();

    const pendingAlerts = await Alert.find({
      status: "SMS_PENDING",
      retryCount: { $lt: 5 },
      $or: [
        { nextRetryAt: { $exists: false } },
        { nextRetryAt: { $lte: now } }
      ]
    });

    for (const alert of pendingAlerts) {

      // 1️⃣ Consent Check
      const consent = await SmsConsent.findOne({ userId: alert.userId });

      if (!consent || !consent.consentGiven) {
        alert.status = "FAILED";
        alert.failureReason = "SMS consent not given";
        await alert.save();
        continue;
      }

      // 2️⃣ Get Contacts
      const contacts = await EmergencyContact.find({
        userId: alert.userId
      });

      if (!contacts.length) {
        alert.status = "FAILED";
        alert.failureReason = "No emergency contacts found";
        await alert.save();
        continue;
      }

      let successCount = 0;

      for (const contact of contacts) {

        const result = await sendSMS(
          contact.phone,
          "Emergency alert triggered"
        );

        // 🔥 CREATE SMS LOG ENTRY
        await SMSLog.create({
          userId: alert.userId,
          alertId: alert._id,
          recipientName: contact.name,
          recipientNumber: contact.phone,
          type: alert.type === "SOS" ? "SOS_ALERT" : "MISSED_ALERT",
          status: result.success ? "SENT" : "FAILED",
          retryCount: alert.retryCount + 1,
          maxRetries: 5,
          lastAttemptAt: new Date(),
          nextRetryAt: result.success
            ? null
            : new Date(Date.now() + 2 * 60 * 1000),
          failureReason: result.success
            ? null
            : result.error || "Unknown SMS error"
        });

        alert.lastAttemptAt = new Date();

        if (result.success) {
          successCount++;
        }
      }

      // 3️⃣ Update Alert Status
      if (successCount > 0) {
        alert.status = "SMS_SENT";
      } else {
        alert.retryCount += 1;

        if (alert.retryCount >= 5) {
          alert.status = "FAILED";
          alert.failureReason = "Max retries exceeded";
        } else {
          alert.status = "SMS_PENDING";
          alert.nextRetryAt = new Date(Date.now() + 2 * 60 * 1000);
        }
      }

      await alert.save();
    }

  } catch (error) {
    console.error("❌ SMS cron error:", error.message);
  }
});