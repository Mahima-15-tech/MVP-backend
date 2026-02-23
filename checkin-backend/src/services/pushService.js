const PushLog = require("../models/PushLog");

async function sendPush(userId, title, body, type) {

  // 1️⃣ Create log
  const pushLog = await PushLog.create({
    userId,
    title,
    body,
    type,
    status: "PENDING"
  });

  try {

    console.log("📲 Sending push to user:", userId);

    // 🔥 Yaha future me FCM integration hoga
    // For now simulate success
    const success = true;

    if (!success) {
      throw new Error("FCM error");
    }

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

module.exports = {
  sendPush
};