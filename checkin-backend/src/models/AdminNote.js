const mongoose = require("mongoose");

const adminNoteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true
    },
    note: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdminNote", adminNoteSchema);