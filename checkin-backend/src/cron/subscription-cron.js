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
      planType: "YEARLY"
    });

    for (const sub of subs) {

      // ✅ ONLY YEARLY MONTHLY REFRESH
      if (sub.nextRenewalDate && today >= sub.nextRenewalDate) {

        console.log("🔄 Yearly monthly refresh for:", sub.userId);

        await resetCredits(sub.userId);      // old remove
        await addCredits(sub.userId, 3, "RENEWAL"); // new 3

        const next = new Date(sub.nextRenewalDate);
        next.setMonth(next.getMonth() + 1);

        sub.nextRenewalDate = next;
        await sub.save();
      }
    }

  } catch (error) {
    console.error("❌ Cron error:", error.message);
  }
});
