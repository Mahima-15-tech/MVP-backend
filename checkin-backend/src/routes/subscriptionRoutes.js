const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");

const {
  startFreeTrial,
  purchasePlan,
  buyTopup,
  getSubscriptionStatus,
  cancelSubscription,
} = require("../controllers/subscriptionController");


// 🔹 Start Free Trial
router.post("/start-trial",  auth, startFreeTrial);
// 🔹 Purchase Monthly / Yearly
router.post("/purchase", auth, purchasePlan);
router.post("/topup", auth, buyTopup);
router.get("/status", auth, getSubscriptionStatus);
router.post("/cancel", auth, cancelSubscription);

module.exports = router;
