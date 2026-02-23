const cron = require("node-cron");
const Subscription = require("../models/subscription");
const User = require("../models/User");
const { resetCredits } = require("../services/creditService");

console.log("🟢 Subscription cron loaded");

cron.schedule("0 0 * * *", async () => {
  console.log("🔁 Checking subscription lifecycle");

  try {
    const today = new Date();

    const subs = await Subscription.find({
      status: "ACTIVE",
    });

    for (const sub of subs) {

      // 🔴 TRIAL EXPIRED
      if (sub.planType === "TRIAL" && today > sub.endDate) {

        console.log("⏳ Trial expired for:", sub.userId);

        // 1️⃣ Reset unused credits
        await resetCredits(sub.userId);

        // 2️⃣ Mark subscription expired
        sub.status = "EXPIRED";
        await sub.save();

        // 3️⃣ Update user status
        await User.findByIdAndUpdate(sub.userId, {
          subscriptionStatus: "EXPIRED",
        });

        console.log("❌ Trial marked expired for:", sub.userId);
      }

    }

  } catch (error) {
    console.error("❌ Subscription cron error:", error.message);
  }
});
