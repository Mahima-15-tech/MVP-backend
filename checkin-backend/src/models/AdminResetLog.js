const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin"
  },
  email: String,
  ipAddress: String,
  status: String, // SUCCESS / FAILED
}, { timestamps: true });

module.exports = mongoose.model("AdminResetLog", schema);