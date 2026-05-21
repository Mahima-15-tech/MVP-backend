const express = require("express");
const router = express.Router();

const {
  createSubscriptionSession
} = require("../controllers/stripeController");

const auth = require("../middleware/auth.middleware");

router.post("/create-subscription", auth, createSubscriptionSession);

module.exports = router;