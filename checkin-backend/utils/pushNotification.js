const User = require("../src/models/User");

async function sendPushNotification(userId, { title, body }) {
  const user = await User.findById(userId);

  if (!user?.deviceToken) return;

  // 👉 yaha tum FCM ya koi service use karoge
  console.log("Push sent to:", user.deviceToken);
  console.log(title, body);

  // future me:
  // await fcm.send(...)
}

module.exports = { sendPushNotification };