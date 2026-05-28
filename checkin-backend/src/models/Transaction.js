const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  planType: {
    type: String,
    enum: ["TRIAL", "MONTHLY", "YEARLY","TOPUP"],
    default: null
  },
  stripePaymentIntentId: String,
  stripeBalanceTransactionId: String,

  amount: Number,
  fee: Number,
  net: Number,


  currency: String,
  type: { type: String, enum: ["SUBSCRIPTION", "TOPUP"] },
  refundId: String,
  refundReason: String, // admin optional (future use)

refundRequestedReason: String, // 🔥 USER SELECTED (IMPORTANT)

refundStatus: {
  type: String,
  enum: ["NONE", "PENDING", "COMPLETED", "FAILED"],
  default: "NONE"
},

refundInitiatedAt: Date,

  status: String
}, { timestamps: true });

module.exports = mongoose.models.Transaction || mongoose.model("Transaction", transactionSchema);