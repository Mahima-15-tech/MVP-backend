const mongoose = require("mongoose");

const promoSchema = new mongoose.Schema({
  code: String,
  duration: String,
  emails: [String],
  message: String,
  expiry: Date,
  status: {
    type: String,
    default: "Not Redeemed"
  },
  isRedeemed: { type: Boolean, default: false },
  redeemedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  redeemedAt: Date
}, { timestamps: true });

module.exports = mongoose.model("Promo", promoSchema);