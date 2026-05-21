const express = require("express");
const router = express.Router();

const { handleIncomingSMS } = require("../controllers/twilioWebhook.controller");

router.post("/webhook", handleIncomingSMS);

module.exports = router;