const mongoose = require("mongoose");

const subscriptionHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    previousPlan: String,
    newPlan: String,
    changedBy: {
      type: String,
      default: "SYSTEM"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "SubscriptionHistory",
  subscriptionHistorySchema
);