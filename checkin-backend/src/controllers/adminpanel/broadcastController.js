const Broadcast = require("../../models/Broadcast");
const admin = require("../../config/firebase");
const User = require("../../models/User");


// SEND BROADCAST
const sendBroadcast = async (req, res) => {
  try {
    const { title, message } = req.body;

    // 1. save broadcast
    const broadcast = await Broadcast.create({
      title,
      message,
      totalUsers: 0,
    });

    // 2. get all users tokens
    const users = await User.find({ fcmToken: { $exists: true } });

    const tokens = users
    .map(u => u.fcmToken?.trim())
    .filter(Boolean);

    // 3. send notification
    // 3. send notification
if (tokens.length > 0) {

  console.log("🔥 TOKENS:", tokens);  // 👈 ADD

  const response = await admin.messaging().sendEachForMulticast({
    tokens,
    notification: {
      title,
      body: message,
    },
  });

  console.log("🔥 FCM RESPONSE:", response);  // 👈 ADD
}

    // 4. update count
    broadcast.totalUsers = tokens.length;
    await broadcast.save();

    res.json({ success: true });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to send" });
  }
};

// GET BROADCASTS (Recent / Archive)
const getBroadcasts = async (req, res) => {
  try {
    const { type } = req.query;

    const now = new Date();
    const days30 = new Date();
    days30.setDate(now.getDate() - 30);

    let filter = {};

    if (type === "recent") {
      filter.createdAt = { $gte: days30 };
    } else {
      filter.createdAt = { $lt: days30 };
    }

    const data = await Broadcast.find(filter).sort({ createdAt: -1 });

    res.json(data);

  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
};

module.exports = {
  sendBroadcast,
  getBroadcasts,
};