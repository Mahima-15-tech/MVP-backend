const EmergencyContact = require("../models/EmergencyContact");

exports.handleIncomingSMS = async (req, res) => {
  try {
    const from = req.body.From; // sender number
    const body = req.body.Body?.trim().toUpperCase();

    console.log("📩 Incoming SMS:", from, body);

    if (body === "YES") {
      await EmergencyContact.updateOne(
        { phone: from },
        { consentStatus: "OPTED_IN" }
      );
    } else if (body === "NO") {
      await EmergencyContact.updateOne(
        { phone: from },
        { consentStatus: "OPTED_OUT" }
      );
    }

    res.send("<Response></Response>"); // Twilio response
  } catch (err) {
    console.error("Webhook error:", err.message);
    res.send("<Response></Response>");
  }
};