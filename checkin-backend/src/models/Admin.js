  // models/Admin.js

  const mongoose = require("mongoose");

  const adminSchema = new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
        default: "Super Admin"
      },

      email: {
        type: String,
        required: true,
        unique: true
      },

      password: {
        type: String,
        required: true
      },

      role: {
        type: String,
        enum: ["SUPER_ADMIN", "ADMIN"],
        required: true
      },

      resetOtp: String,
      resetOtpExpires: Date,
      resetOtpAttempts: { type: Number, default: 0 },
      resetOtpBlockedUntil: Date,
      lastOtpSentAt: Date,

      isActive: {
        type: Boolean,
        default: true
      }
    },
    { timestamps: true }
  );

  module.exports = mongoose.model("Admin", adminSchema);