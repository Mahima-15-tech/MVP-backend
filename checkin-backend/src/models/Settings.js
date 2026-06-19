const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  stripeSecretKey: String,
  twilioAccountSid: String,
  twilioAuthToken: String
}, { timestamps: true });

module.exports = mongoose.model("Settings", settingsSchema);