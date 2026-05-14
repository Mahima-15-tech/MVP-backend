const cron = require("node-cron");
const Subscription = require("../models/subscription");
const User = require("../models/User");
const { resetCredits,  addCredits } = require("../services/creditService");

console.log("🟢 Subscription cron loaded");

cron.schedule("* * * * *", async () => {
  console.log("🔁 Checking subscription lifecycle");

  try {
    const today = new Date();
    today.setHours(0,0,0,0);

    const subs = await Subscription.find({
      status: "ACTIVE",
      planType: { $in: ["YEARLY", "UNLIMITED"] }
    });

    for (const sub of subs) {

      if (!sub.nextRenewalDate) continue;

      const renewalDate = new Date(sub.nextRenewalDate);
      renewalDate.setHours(0,0,0,0);

      if (today >= renewalDate) {

        console.log("🔄 Monthly refresh for:", sub.planType, sub.userId);

        await resetCredits(sub.userId);
        await addCredits(sub.userId, sub.creditsPerCycle, "RENEWAL");

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
