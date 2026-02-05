const mongoose = require("mongoose");

const checkinSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    checkInTime: { type: String, required: true }, // "09:00"
    graceMinutes: { type: Number, default: 1 },
    lastCheckInAt: { type: Date },
    status: {
      type: String,
      enum: ["ACTIVE", "PAUSED", "ALERTED"],
      default: "ACTIVE",
    },
    
  },
  { timestamps: true }
);

module.exports = mongoose.model("CheckinSchedule", checkinSchema);
