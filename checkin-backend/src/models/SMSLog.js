const mongoose = require("mongoose");

const smsLogSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  alertId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Alert"
  },

  recipientName: {
    type: String,
    required: true
  },

  recipientNumber: {
    type: String,
    required: true
  },

  twilioMessageId: String,

  status: {
    type: String,
    enum: ["PENDING", "SENT", "FAILED", "DELIVERED"],
    default: "PENDING"
  },

  retryCount: {
    type: Number,
    default: 0
  },

  maxRetries: {
    type: Number,
    default: 5
  },

  plivoMessageId: String,
  lastAttemptAt: Date,
  nextRetryAt: Date,
  failureReason: String

}, { timestamps: true });

module.exports = mongoose.model("SMSLog", smsLogSchema);