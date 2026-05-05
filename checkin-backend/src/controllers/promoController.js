const Promo = require("../models/Promo");
const sendEmail = require("../../utils/sendEmail");
const User = require("../models/User"); 
const Subscription = require("../models/subscription"); 

exports.createPromo = async (req, res) => {
  try {
    const { code, duration, emails, message } = req.body;

    if (!code || !duration || !emails || emails.length === 0) {
      return res.status(400).json({ error: "Missing fields" });
    }

    let expiry;
    const now = new Date();

    if (duration === "1 Month") {
      expiry = new Date(now.setMonth(now.getMonth() + 1));
    } else if (duration === "1 Year") {
      expiry = new Date(now.setFullYear(now.getFullYear() + 1));
    } else {
      expiry = null;
    }

    const promo = await Promo.create({
      code,
      duration,
      emails,
      message,
      expiry
    });

    // send email
    for (let email of emails) {

      const finalMessage = message
        .replace("[CODE]", code)
        .replace("[DURATION]", duration);

      await sendEmail(email, finalMessage);
    }

    res.json({ success: true, promo });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPromos = async (req, res) => {
    try {
  
      const promos = await Promo.find().sort({ createdAt: -1 });
  
      const formatted = promos.map(p => {

        let status = "Not Redeemed";
      
        if (p.isRedeemed) status = "Redeemed";
        else if (p.expiry && new Date(p.expiry) < new Date()) {
          status = "Expired";
        }
      
        return {
          code: p.code,
          duration: p.duration,
      
          email: p.emails.join(", "),
      
          date: new Date(p.createdAt).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
          }),
      
          status, // ✅ important
      
          expiry: p.expiry
            ? new Date(p.expiry).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
              })
            : "-"
        };
      
      });
  
      res.json(formatted);
  
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  exports.redeemPromo = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { code } = req.body;

    const promo = await Promo.findOne({ code });

    if (!promo) {
      return res.status(404).json({ error: "Invalid code" });
    }

    if (promo.expiry && new Date(promo.expiry) < new Date()) {
      return res.status(400).json({ error: "Code expired" });
    }

    if (promo.isRedeemed) {
      return res.status(400).json({ error: "Already used" });
    }

    // 🔥 PLAN MAP
    let planType;
    if (promo.duration === "1 Month") planType = "MONTHLY";
    else if (promo.duration === "1 Year") planType = "YEARLY";
    else planType = "YEARLY"; // unlimited treat as yearly (or custom later)

    const startDate = new Date();
    const endDate = new Date(startDate);

    if (planType === "MONTHLY") {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    let sub = await Subscription.findOne({ userId });

    if (!sub) {
      // ✅ NEW SUBSCRIPTION
      sub = await Subscription.create({
        userId,
        planType,
        startDate,
        endDate,
        status: "ACTIVE",
        creditsPerCycle: 3
      });
    } else {
      // ✅ UPDATE EXISTING
      sub.planType = planType;
      sub.startDate = startDate;
      sub.endDate = endDate;
      sub.status = "ACTIVE";

      await sub.save();
    }

    // ✅ update user status
    await User.findByIdAndUpdate(userId, {
      subscriptionStatus: "ACTIVE"
    });

    // ✅ mark promo used
    promo.isRedeemed = true;
    await promo.save();

    res.json({
      success: true,
      message: "Promo applied successfully",
      planType,
      endDate
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

  exports.getPromoStats = async (req, res) => {
    const total = await Promo.countDocuments();
    const redeemed = await Promo.countDocuments({ isRedeemed: true });
    const expired = await Promo.countDocuments({
      expiry: { $lt: new Date() }
    });
  
    res.json({
      total,
      redeemed,
      expired,
      notRedeemed: total - redeemed - expired
    });
  };