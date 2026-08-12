const express = require("express");
const router = express.Router();

const {
  createSubscriptionSession,
  createTrialSession,
  cancelSubscription,
  upgradeSubscription,
  refundPayment,
  createTopupSession,
  openCustomerPortal
} = require("../controllers/stripeController");

const auth = require("../middleware/auth.middleware");

router.post("/create-trial", auth, createTrialSession);

router.post("/create-subscription", auth, createSubscriptionSession);
router.post("/cancel-subscription", auth, cancelSubscription);
// router.post("/upgrade-subscription", auth, upgradeSubscription);
router.post("/admin/refund", auth, refundPayment);
router.post("/create-topup", auth, createTopupSession);
router.post("/open-portal", auth, openCustomerPortal);

module.exports = router;