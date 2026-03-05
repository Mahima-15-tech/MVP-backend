const mongoose = require("mongoose");

const contactHistorySchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  name: String,
  phone: String,
  relation: String,

  action: {
    type: String,
    enum: ["ADDED", "UPDATED", "DELETED"]
  },

  consentStatus: {
    type: String,
    enum: ["PENDING", "ACCEPTED", "REJECTED", "OPT_OUT"]
  },

  actionBy: {
    type: String,
    enum: ["USER", "SYSTEM"]
  }

}, { timestamps: true });

module.exports = mongoose.model("ContactHistory", contactHistorySchema);