const mongoose = require("mongoose");

const phoneRegistrySchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true
  },
  trialUsed: {
    type: Boolean,
    default: false
  },
  isBanned: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model("PhoneRegistry", phoneRegistrySchema);