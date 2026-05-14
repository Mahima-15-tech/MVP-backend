const mongoose = require("mongoose");

const promoSchema = new mongoose.Schema({
  code: { type: String, unique: true },

  duration: {
    type: String,
    enum: ["1 Month", "1 Year", "Unlimited"], // 👈 UI same
    required: true
  },

  emails: [String], // 👈 kis-kis ko bhejna hai

  message: String, // 👈 email content

  validityDays: Number, // code expire hone ke liye

  expiresAt: Date,

  isActive: {
    type: Boolean,
    default: true
  },

  isRedeemed: {
    type: Boolean,
    default: false
  },

  redeemedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  redeemedAt: Date

}, { timestamps: true });

module.exports = mongoose.model("Promo", promoSchema);