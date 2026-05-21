const cron = require("node-cron");
const Checkin = require("../models/CheckinSchedule");
const Alert = require("../models/Alert");
const User = require("../models/User");
const EmergencyContact = require("../models/EmergencyContact");
const CheckinLog = require("../models/CheckinLog");
const Subscription = require("../models/subscription");
const CreditTransaction = require("../models/creditTransaction");
const { sendSMS } = require("../services/smsService");

const { deductCredit } = require("../services/creditService");
const { sendPush } = require("../services/pushService");

console.log("🟢 Check-in cron file loaded");

// helper → start of day
const getStartOfDay = () => {
  const d = new Date();
  d.setHours(0,0,0,0);
  return d;
};

cron.schedule("* * * * *", async () => {

  console.log("⏰ Running check-in cron");

  try {

    const now = new Date();

    const checkins = await Checkin.find({
      status: "ACTIVE"
    }).populate("userId");

    for (const checkin of checkins) {

      // 1️⃣ orphan cleanup
      if (!checkin.userId) {

        console.warn("⚠️ Orphan check-in found. Removing:", checkin._id);

        await Checkin.findByIdAndDelete(checkin._id);

        continue;
      }

      const user = checkin.userId;

      // 2️⃣ subscription check
      if (user.subscriptionStatus !== "ACTIVE") {

        continue;
      }

      // 3️⃣ loop through all scheduled times
      for (const time of checkin.checkInTimes) {

        const [hh, mm] = time.split(":");

        const scheduled = new Date();
        scheduled.setHours(hh, mm, 0, 0);

        const graceEnd = new Date(
          scheduled.getTime() + checkin.graceMinutes * 60000
        );

        // not yet time
        if (now <= graceEnd) continue;

        // 4️⃣ check if already handled today
        const existingLog = await CheckinLog.findOne({
          userId: user._id,
          scheduledTime: time,
          createdAt: { $gte: getStartOfDay() }
        });

        if (existingLog) {

          continue;
        }

        console.log("🚨 Missed check-in detected:", user._id, time);

        // 5️⃣ deduct credit
        try {

          await deductCredit(user._id, "MISSED_ALERT");

          console.log("💳 Credit deducted:", user._id);

        } catch (err) {

          console.log("❌ No credits remaining:", user._id);

          continue;
        }

        // 6️⃣ create alert
        const alert = await Alert.create({

          userId: user._id,

          type: "MISSED_CHECKIN",

          language: user.language,

          alertVoice: user.alertVoice,

          location: user.lastKnownLocation || null,

          creditsUsed: 1,

          status: "SMS_PENDING",

          retryCount: 0

        });

        console.log("📢 Alert created:", alert._id);

        // 7️⃣ create MISSED log
        await CheckinLog.create({

          userId: user._id,

          scheduledTime: time,

          status: "MISSED",

          checkedAt: null

        });

        console.log("📝 Check-in log saved");

        // 8️⃣ send push notification
        await sendPush(

          user._id,

          "Missed Check-in",

          `You missed your ${time} check-in. Please resume.`,

          "MISSED_ALERT"

        );

        // 9️⃣ pause check-in
        await Checkin.findByIdAndUpdate(

          checkin._id,

          { status: "PAUSED" }

        );

        console.log("⏸ Check-in paused:", user._id);

        // 🔟 fetch contacts (SMS engine will use)
        const contacts = await EmergencyContact.find({
          userId: user._id,
          consentStatus: "OPTED_IN"
        });

        if (contacts.length === 0) {
          console.log("⚠️ No consented contacts found");
          continue;
        }
        
        for (const contact of contacts) {
        
          try {
        
            let pronoun = "they";
let possessive = "their";

if (user.gender === "MALE") {
  pronoun = "he";
  possessive = "his";
}
if (user.gender === "FEMALE") {
  pronoun = "she";
  possessive = "her";
}

const locationLink = user.lastKnownLocation
  ? `https://maps.google.com/?q=${user.lastKnownLocation.lat},${user.lastKnownLocation.lng}`
  : "Location not available";

  const message = `🚨 ${user.name} missed check-in. Location: ${locationLink}`;
        
            await sendSMS({
              userId: user._id,
              alertId: alert._id,
              recipientName: contact.name,
              recipientNumber: contact.phone,
              message,
              type: "MISSED_ALERT"
            });
        
            console.log("✅ SMS sent to:", contact.phone);
        
          } catch (err) {
        
            console.error("❌ SMS failed:", contact.phone, err.message);
        
          }
        }

        await Alert.findByIdAndUpdate(alert._id, {
          status: "SMS_SENT"
        });

        console.log("📞 Contacts ready:", contacts.length);

        

      }

    }

    /* ================= AUTO DELETE UNVERIFIED USERS ================= */

try {

  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const usersToDelete = await User.find({
    isVerified: true,
    createdAt: { $lt: cutoff },
    $or: [
      { nameCompleted: false },
      { emailCompleted: false },
      { nameCompleted: { $exists: false } },
      { emailCompleted: { $exists: false } }
    ]
  });

  if (usersToDelete.length > 0) {

    const userIds = usersToDelete.map(u => u._id);

    console.log(`🧹 Deleting ${userIds.length} unverified users`);

    await EmergencyContact.deleteMany({ userId: { $in: userIds } });
    await Checkin.deleteMany({ userId: { $in: userIds } });
    await Alert.deleteMany({ userId: { $in: userIds } });

    await Subscription.deleteMany({ userId: { $in: userIds } });
    await CreditTransaction.deleteMany({ userId: { $in: userIds } });

    await User.deleteMany({ _id: { $in: userIds } });

  }

} catch (err) {
  console.error("❌ Auto-delete error:", err.message);
}

  } catch (error) {

    console.error("❌ Check-in cron error:", error.message);

  }

  

});