const cron = require("node-cron");
const Checkin = require("../models/CheckinSchedule");
const Alert = require("../models/Alert");
const User = require("../models/User");
const EmergencyContact = require("../models/EmergencyContact");
const { deductCredit } = require("../services/creditService");
const { sendPush } = require("../services/pushService");


console.log("🟢 Check-in cron file loaded");



// Helper: check if missed
const isMissedCheckin = (checkin) => {
  const now = new Date();

  const [hh, mm] = checkin.checkInTime.split(":");

  const scheduled = new Date();
  scheduled.setHours(parseInt(hh), parseInt(mm), 0, 0);

  const graceEnd = new Date(
    scheduled.getTime() + checkin.graceMinutes * 60000
  );

  if (!checkin.lastCheckInAt && now > graceEnd) {
    return true;
  }

  return false;
};



cron.schedule("* * * * *", async () => {
  console.log("⏰ Running check-in cron");

  try {
    const checkins = await Checkin.find({ status: "ACTIVE" }).populate("userId");

    for (const checkin of checkins) {

      // 1️⃣ Orphan cleanup
      if (!checkin.userId) {
        console.warn("⚠️ Orphan check-in found. Removing:", checkin._id);
        await Checkin.findByIdAndDelete(checkin._id);
        continue;
      }

      const user = checkin.userId;

      // 2️⃣ Subscription check
      if (user.subscriptionStatus !== "ACTIVE") {
        // console.log("⛔ Subscription not active for user:", user._id);
        continue;
      }

      // 3️⃣ Check missed
      if (!isMissedCheckin(checkin)) {
        continue;
      }

      console.log("🚨 Missed check-in detected for user:", user._id);

      // 4️⃣ Deduct credit safely
      try {
        await deductCredit(user._id, "MISSED_ALERT");
        console.log("💳 Credit deducted for user:", user._id);
      } catch (err) {
        console.log("❌ No credits remaining. Skipping alert for:", user._id);
        continue;
      }

      // try {
      //   await deductCredit(checkin.userId._id, "MISSED_ALERT");
      //   console.log("💳 Credit deducted for user:", checkin.userId._id);
      // } catch (err) {
      //   console.log("❌ No credits. Skipping alert.");
      //   continue; // important
      // }
      

      // 5️⃣ Create alert
      const alert = await Alert.create({
        userId: checkin.userId._id,
        type: "MISSED_CHECKIN",
        language: checkin.userId.language,
        alertVoice: checkin.userId.alertVoice,
        location: checkin.userId.lastKnownLocation || null,
        creditsUsed: 1,
        status: "SMS_PENDING",
        retryCount: 0
      });

      // 🔔 Send push notification
await sendPush(
  user._id,
  "Missed Check-in",
  "You missed your scheduled check-in. Please resume.",
  "MISSED_ALERT"
);
      
      console.log("📢 Alert created:", alert._id);

      // 6️⃣ Auto pause check-in
      await Checkin.findByIdAndUpdate(checkin._id, {
        status: "PAUSED",
        lastCheckInAt: new Date()
      });
      

      console.log("⏸ Check-in auto paused for user:", user._id);

      // 7️⃣ Fetch emergency contacts (for next SMS system)
      const contacts = await EmergencyContact.find({
        userId: user._id,
      });

      console.log("📞 Contacts ready:", contacts.length);

      // NOTE: SMS sending will happen in separate SMS engine
    }

  } catch (error) {
    console.error("❌ Check-in cron error:", error.message);
  }

});
