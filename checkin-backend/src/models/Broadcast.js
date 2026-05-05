const mongoose = require("mongoose");

const broadcastSchema = new mongoose.Schema(
  {
    title: String,
    message: String,
    totalUsers: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Broadcast", broadcastSchema);