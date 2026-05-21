const PushLog = require("../models/PushLog");
const User = require("../models/User");
const admin = require("../config/firebase");

async function sendPush(userId, title, body, type) {

  const pushLog = await PushLog.create({
    userId,
    title,
    body,
    type,
    status: "PENDING"
  });

  try {

    const user = await User.findById(userId);

    if (!user || !user.fcmToken) {
      throw new Error("No FCM token found");
    }

    console.log("📲 Sending push to:", user.fcmToken);

    await admin.messaging().send({
      token: user.fcmToken,
      notification: {
        title,
        body,
      },
    });

    pushLog.status = "SENT";
    pushLog.sentAt = new Date();
    await pushLog.save();

    console.log("✅ Push sent");

  } catch (error) {

    pushLog.status = "FAILED";
    pushLog.failureReason = error.message;
    await pushLog.save();

    console.log("❌ Push failed:", error.message);
  }
}

module.exports = { sendPush };