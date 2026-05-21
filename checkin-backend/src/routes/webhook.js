const express = require("express");
const router = express.Router();

const { stripeWebhook } = require("../controllers/webhookController");

router.post("/stripe", stripeWebhook);

module.exports = router;