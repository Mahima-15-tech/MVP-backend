const mongoose = require("mongoose");

const checkinLogSchema = new mongoose.Schema(
{
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  scheduledTime: String,

  status: {
    type: String,
    enum: ["CHECKED_IN", "MISSED"],
  },

  checkedAt: Date

},
{ timestamps: true }
);

module.exports = mongoose.model("CheckinLog", checkinLogSchema);