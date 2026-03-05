const SupportTicket = require("../models/SupportTicket");

exports.createTicket = async (req, res) => {
  try {

    const { email, subject, description } = req.body;

    if (!email || !subject || !description) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const ticket = await SupportTicket.create({
      userId: req.user.userId,
      email,
      subject,
      description,
      attachmentUrl: req.file?.path || null
    });

    res.json({
      message: "Support request submitted",
      ticket
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// const SupportTicket = require("../../models/SupportTicket");

// Get All Tickets
exports.getAllTickets = async (req, res) => {
  const tickets = await SupportTicket.find()
    .populate("userId", "name phone")
    .sort({ createdAt: -1 });

  res.json(tickets);
};

// Update Status / Priority
exports.updateTicket = async (req, res) => {

  const { id } = req.params;
  const { status, priority } = req.body;

  const ticket = await SupportTicket.findById(id);

  if (!ticket) {
    return res.status(404).json({ message: "Ticket not found" });
  }

  if (status) ticket.status = status;
  if (priority) ticket.priority = priority;

  ticket.unreadByAdmin = false;

  await ticket.save();

  res.json({ message: "Ticket updated", ticket });
};

// Add Reply
exports.replyTicket = async (req, res) => {

  const { id } = req.params;
  const { message } = req.body;

  const ticket = await SupportTicket.findById(id);

  if (!ticket) {
    return res.status(404).json({ message: "Ticket not found" });
  }

  ticket.replies.push({
    sender: "ADMIN",
    message
  });

  ticket.status = "IN_PROGRESS";

  await ticket.save();

  res.json({ message: "Reply added", ticket });
};

exports.getUnreadCount = async (req, res) => {
  const count = await SupportTicket.countDocuments({
    unreadByAdmin: true
  });

  res.json({ count });
};