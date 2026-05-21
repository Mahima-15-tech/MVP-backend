const express = require("express");
const router = express.Router();

const {
  createSubscriptionSession,
  cancelSubscription,
  upgradeSubscription,
  refundPayment
} = require("../controllers/stripeController");

const auth = require("../middleware/auth.middleware");

router.post("/create-subscription", auth, createSubscriptionSession);
router.post("/cancel-subscription", auth, cancelSubscription);
router.post("/upgrade-subscription", auth, upgradeSubscription);
router.post("/admin/refund", auth, refundPayment);

module.exports = router;