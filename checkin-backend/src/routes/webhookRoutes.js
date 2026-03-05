const express = require("express");
const router = express.Router();

const { appleWebhook } = require("../controllers/webhookController");

router.post("/apple", appleWebhook);
router.post("/plivo-status", async (req, res) => {

    const { MessageUUID, MessageStatus } = req.body;
  
    const smsLog = await SMSLog.findOne({ plivoMessageId: MessageUUID });
  
    if (smsLog) {
      smsLog.status = MessageStatus === "delivered"
        ? "DELIVERED"
        : "FAILED";
  
      await smsLog.save();
    }
  
    res.sendStatus(200);
  });

module.exports = router;
