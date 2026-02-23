const Subscription = require("../models/subscription");
const { addCredits } = require("../services/creditService");
const User = require("../models/User");
const { resetCredits } = require("../services/creditService");


exports.appleWebhook = async (req, res) => {

    const { userId, eventType } = req.body;
  
    if (eventType === "RENEWAL") {
  
      const sub = await Subscription.findOne({ userId });
  
      if (!sub) return res.status(404).send("Subscription not found");
  
      await resetCredits(userId);
  
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);
  
      sub.planType = "MONTHLY";
      sub.startDate = startDate;
      sub.endDate = endDate;
      sub.nextRenewalDate = endDate;
      sub.status = "ACTIVE";
      sub.creditsPerCycle = 3;
  
      await sub.save();
  
      // 🔥 ADD THIS
      await User.findByIdAndUpdate(userId, {
        subscriptionStatus: "ACTIVE"
      });
  
      await addCredits(userId, 3, "RENEWAL");
  
      console.log("✅ Monthly renewed for:", userId);
    }
  
    res.sendStatus(200);
  };
  
  
