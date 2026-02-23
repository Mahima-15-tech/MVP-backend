const express = require("express");
const router = express.Router();

const { appleWebhook } = require("../controllers/webhookController");

router.post("/apple", appleWebhook);

module.exports = router;
