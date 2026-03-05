const mongoose = require("mongoose");

const smsConsentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  contactPhone: String,

  consentStatus: {
    type: String,
    enum: ["PENDING", "ACCEPTED", "REJECTED", "OPT_OUT"],
    default: "PENDING"
  },

  updatedAt: Date

}, { timestamps: true });

module.exports = mongoose.model("SmsConsent", smsConsentSchema);