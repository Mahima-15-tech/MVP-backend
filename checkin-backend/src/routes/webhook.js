const express = require("express");
const router = express.Router();

const { stripeWebhook } = require("../controllers/stripeWebhook");

router.post("/stripe", stripeWebhook);

module.exports = router;