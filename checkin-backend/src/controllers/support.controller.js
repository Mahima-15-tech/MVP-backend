const SupportTicket = require("../models/SupportTicket");
const User = require("../models/User");
const { sendMail } = require("../../utils/mail");

exports.createTicket = async (req, res) => {
  try {

    const { subject, description } = req.body;

    if (!subject || !description) {
      return res.status(400).json({
        message: "Subject and description are required"
      });
    }

    // user fetch
    const user = await User.findById(req.user.userId);

    const ticket = await SupportTicket.create({
      userId: req.user.userId,
      email: user.email,   
      subject,
      description,
      attachmentUrl: req.file?.path || null
    });

    try {
      await sendMail({
        to: process.env.CLIENT_SUPPORT_EMAIL,
        subject: `New Support Ticket: ${subject}`,
        html: `
          <h3>New Support Request</h3>
          <p><b>User:</b> ${user.email}</p>
          <p><b>Subject:</b> ${subject}</p>
          <p><b>Description:</b> ${description}</p>
        `,
        replyTo: user.email   
      });

      await sendMail({
        to: user.email,
        subject: "We've received your request",
        html: `
          <p>Hi ${user.name || "User"},</p>
          <p>Thanks for reaching out to us. Our team will get back to you within 24 hours.</p>
          <br/>
          <small>Team SOLO</small>
        `
      });
    
      console.log("✅ MAIL SENT");
    
    } catch (err) {
      console.log("❌ MAIL ERROR:", err);
    }


     

    

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

  await sendMail({
    to: ticket.email, 
    subject: `Reply on your ticket: ${ticket.subject}`,
    html: `
      <p>${message}</p>
      <br/>
      <small>Support Team</small>
    `
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