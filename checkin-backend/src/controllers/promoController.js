const Promo = require("../models/Promo");
const sendEmail = require("../../utils/sendEmail");
const User = require("../models/User"); 
const Subscription = require("../models/subscription"); 
const { addCredits, resetCredits } = require("../services/creditService");

exports.createPromo = async (req, res) => {
  try {
    const { code, duration, emails, message } = req.body;

    let expiresAt = null;

    const now = new Date();

    if (duration === "1 Month") {
      expiresAt = new Date();
      expiresAt.setMonth(now.getMonth() + 1); // ✅ 1 month
    }

    if (duration === "1 Year") {
      expiresAt = new Date();
      expiresAt.setFullYear(now.getFullYear() + 1); // ✅ 1 year
    }

    if (duration === "Unlimited") {
      expiresAt = null; // ✅ no expiry
    }

    const promo = await Promo.create({
      code,
      duration,
      emails,
      message,
      expiresAt
    });

    // send emails
    for (let email of emails) {
      await sendEmail(email, code, duration, message);
    }

    res.json({ success: true, promo });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Promo code already exists" });
    }
    res.status(500).json({ error: err.message });
  }
};


exports.getPromos = async (req, res) => {
  try {
    const promos = await Promo.find().sort({ createdAt: -1 });

    const formatted = promos.map(p => {
      let status = "Not Redeemed";

      if (p.isRedeemed) status = "Redeemed";
      else if (p.expiresAt && new Date() > p.expiresAt) {
        status = "Expired";
      }

      return {
        code: p.code,
        duration: p.duration,
        emails: p.emails, // 👈 ADD THIS
        createdAt: p.createdAt,
        expiresAt: p.expiresAt,
        status
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

    if (!promo) return res.status(404).json({ error: "Invalid code" });

    if (!promo.isActive)
      return res.status(400).json({ error: "Promo disabled" });

    if (promo.expiresAt && new Date() > promo.expiresAt)
      return res.status(400).json({ error: "Promo expired" });

    if (promo.isRedeemed)
      return res.status(400).json({ error: "Already used" });

    // 🔥 CONVERT DURATION → PLAN
    let planType;
    if (promo.duration === "1 Month") planType = "MONTHLY";
    if (promo.duration === "1 Year") planType = "YEARLY";
    if (promo.duration === "Unlimited") planType = "UNLIMITED";

    let startDate = new Date();
    let endDate = null;
    let nextRenewalDate = null;

    if (planType === "MONTHLY") {
      endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);
    }

    if (planType === "YEARLY") {
      endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1);

      nextRenewalDate = new Date();
      nextRenewalDate.setMonth(nextRenewalDate.getMonth() + 1);
    }

    if (planType === "UNLIMITED") {
      endDate = null;

      nextRenewalDate = new Date();
      nextRenewalDate.setMonth(nextRenewalDate.getMonth() + 1);
    }

    let sub = await Subscription.findOne({ userId });

    if (!sub) {
      sub = await Subscription.create({
        userId,
        planType,
        startDate,
        endDate,
        status: "ACTIVE",
        creditsPerCycle: 3,
        nextRenewalDate
      });
    } else {
      sub.planType = planType;
      sub.startDate = startDate;
      sub.endDate = endDate;
      sub.status = "ACTIVE";
      sub.creditsPerCycle = 3;
      sub.nextRenewalDate = nextRenewalDate;

      await sub.save();
    }

    // credits
    await resetCredits(userId);
    await addCredits(userId, 3, "PROMO");

    // user update
    await User.findByIdAndUpdate(userId, {
      subscriptionStatus: "ACTIVE"
    });

    // mark used
    promo.isRedeemed = true;
    promo.redeemedBy = userId;
    promo.redeemedAt = new Date();
    await promo.save();

    res.json({
      success: true,
      message: "Promo applied",
      plan: planType
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

  exports.togglePromo = async (req, res) => {
    const { code } = req.body;
  
    const promo = await Promo.findOne({ code });
  
    if (!promo) return res.status(404).json({ error: "Not found" });
  
    promo.isActive = !promo.isActive;
    await promo.save();
  
    res.json({
      success: true,
      isActive: promo.isActive
    });
  };

exports.getPromoStats = async (req, res) => {
  try {

    const now = new Date();

    const total = await Promo.countDocuments();

    const redeemed = await Promo.countDocuments({ isRedeemed: true });

    const expired = await Promo.countDocuments({
      expiresAt: { $ne: null, $lt: now }, // ✅ FIX
      isRedeemed: false                   // ✅ optional but better
    });

    const notRedeemed = await Promo.countDocuments({
      isRedeemed: false,
      $or: [
        { expiresAt: null },
        { expiresAt: { $gte: now } }
      ]
    });

    res.json({
      total,
      redeemed,
      expired,
      notRedeemed
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};