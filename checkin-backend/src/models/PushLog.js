const mongoose = require("mongoose");

const pushLogSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  alertId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Alert"
  },

  title: {
    type: String,
    required: true
  },

  body: {
    type: String,
    required: true
  },

  type: {
    type: String,
    enum: ["CHECKIN_REMINDER", "MISSED_ALERT", "SYSTEM"],
    required: true
  },

  status: {
    type: String,
    enum: ["PENDING", "SENT", "FAILED"],
    default: "PENDING"
  },

  failureReason: String,
  sentAt: Date

}, { timestamps: true });

module.exports = mongoose.model("PushLog", pushLogSchema);