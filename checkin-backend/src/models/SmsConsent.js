const mongoose = require("mongoose");

const smsConsentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  consentGiven: {
    type: Boolean,
    default: false
  },
  consentGivenAt: Date,
  consentRevokedAt: Date
}, { timestamps: true });

module.exports = mongoose.model("SmsConsent", smsConsentSchema);