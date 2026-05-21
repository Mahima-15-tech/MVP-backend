const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  stripePaymentIntentId: String,
  stripeBalanceTransactionId: String,

  amount: Number,
  fee: Number,
  net: Number,

  currency: String,
  type: { type: String, enum: ["SUBSCRIPTION", "TOPUP"] },

  status: String
}, { timestamps: true });

module.exports = mongoose.models.Transaction || mongoose.model("Transaction", transactionSchema);