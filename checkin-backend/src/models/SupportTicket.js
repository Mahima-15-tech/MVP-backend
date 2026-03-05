const mongoose = require("mongoose");

const replySchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ["ADMIN", "USER"],
    required: true
  },
  message: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const supportTicketSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  email: String,
  subject: String,
  description: String,

  attachmentUrl: String,

  status: {
    type: String,
    enum: ["OPEN", "IN_PROGRESS", "RESOLVED"],
    default: "OPEN"
  },

  priority: {
    type: String,
    enum: ["LOW", "MEDIUM", "HIGH"],
    default: "MEDIUM"
  },

  unreadByAdmin: {
    type: Boolean,
    default: true
  },

  replies: [replySchema]

}, { timestamps: true });

module.exports = mongoose.model("SupportTicket", supportTicketSchema);