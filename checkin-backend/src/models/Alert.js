const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: { type: String }, // MISSED_CHECKIN
  location: {
    lat: Number,
    lng: Number,
    updatedAt: Date,
  },
  language: String,
  alertVoice: String,
  status: {
    type: String,
    enum: ["CREATED", "SMS_PENDING", "SMS_SENT", "FAILED"],
    default: "CREATED"
  },
  creditsUsed: Number,
  retryCount: { type: Number, default: 0 },
nextRetryAt: Date,
lastAttemptAt: Date,
failureReason: String,
  
}, { timestamps: true });

module.exports = mongoose.model("Alert", alertSchema);
