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
  status: { type: String, default: "CREATED" },
}, { timestamps: true });

module.exports = mongoose.model("Alert", alertSchema);
