const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  planType: {
    type: String,
    enum: ["TRIAL", "MONTHLY", "YEARLY", "UNLIMITED"],
    required: true,
  },

  status: {
    type: String,
    enum: ["ACTIVE", "EXPIRED", "CANCELLED"],
    default: "ACTIVE",
  },

  stripeCustomerId: String,
stripeSubscriptionId: String,
stripePriceId: String,

  startDate: Date,
  endDate: Date,
  nextRenewalDate: Date,

  autoRenew: { type: Boolean, default: false },

  creditsPerCycle: Number,

  trialUsed: { type: Boolean, default: false },

}, { timestamps: true });

module.exports = mongoose.model("Subscription", subscriptionSchema);
