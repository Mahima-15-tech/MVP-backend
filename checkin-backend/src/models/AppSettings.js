// models/AppSettings.js
const mongoose = require("mongoose");

const appSettingsSchema = new mongoose.Schema({
  commission: {
    type: Number,
    default: 15 // %
  }
});

module.exports = mongoose.model("AppSettings", appSettingsSchema);