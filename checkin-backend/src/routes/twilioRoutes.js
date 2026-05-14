const express = require("express");
const router = express.Router();
const EmergencyContact = require("../models/EmergencyContact");

router.post("/webhook", async (req, res) => {
  try {
    const msg = req.body.Body.toLowerCase();
    const from = req.body.From;

    let status = "PENDING";

    if (msg === "yes") status = "OPTED_IN";
    if (msg === "no") status = "OPTED_OUT";

    await EmergencyContact.findOneAndUpdate(
      { phone: from },
      {
        consentStatus: status,
        consentDate: new Date()
      }
    );

    res.send("<Response></Response>");

  } catch (err) {
    res.status(500).send("Error");
  }
});

module.exports = router;