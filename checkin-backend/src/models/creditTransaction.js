const mongoose = require("mongoose");

const creditTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  type: {
    type: String,
    enum: ["DEDUCT", "ADD"],
    required: true,
  },

  reason: {
    type: String,
    enum: [
      "TRIAL",
      "RENEWAL",
      "TOPUP",
      "MISSED_ALERT",
      "SOS",
      "ADMIN_ADJUSTMENT"
    ],
  },
  

  amount: { type: Number, required: true },

  balanceAfter: Number,

}, { timestamps: true });

module.exports = mongoose.model("CreditTransaction", creditTransactionSchema);
