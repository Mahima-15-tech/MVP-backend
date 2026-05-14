const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: { type: String }, // MISSED_CHECKIN
  location: {
    lat: Number,
    lng: Number,
    address: String,
    updatedAt: Date,
  },
  language: String,
  alertVoice: String,
  status: {
    type: String,
    enum: ["CREATED", "SMS_PENDING", "SMS_SENT", "FAILED"],
    default: "CREATED"
  },
  expiresAt: Date,
  creditsUsed: Number,
  retryCount: { type: Number, default: 0 },
nextRetryAt: Date,
lastAttemptAt: Date,
failureReason: String,
smsDetails: [
  {
    contactId: { type: mongoose.Schema.Types.ObjectId, ref: "EmergencyContact" },
    status: String,
    retryCount: Number,
    lastAttemptAt: Date,
    failureReason: String
  }
],

  
}, { timestamps: true });

module.exports = mongoose.model("Alert", alertSchema);
