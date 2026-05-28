const SupportTicket = require("../models/SupportTicket");
const User = require("../models/User");
const { sendMail } = require("../../utils/mail");
const Transaction = require("../models/Transaction");

exports.createTicket = async (req, res) => {
  try {

    const { subject, description, isRefundRequest, refundReason, transactionId } = req.body;

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
      attachmentUrl: req.file?.path || null,
    
      isRefundRequest: isRefundRequest || false,
      refundReason: refundReason || null,
      transactionId: transactionId || null
    });

    // 🔥 REFUND LINK LOGIC
    if (isRefundRequest) {

      const txn = await Transaction.findOne({
        userId: req.user.userId,
        status: "SUCCESS"
      }).sort({ createdAt: -1 });
    
      if (txn) {
        txn.refundRequestedReason = refundReason;
        txn.refundStatus = "PENDING";
        txn.refundInitiatedAt = new Date();
    
        await txn.save();
      }
    }

    try {

      // ✅ 1. MAIL TO SUPPORT TEAM
      await sendMail({
        to: process.env.CLIENT_SUPPORT_EMAIL,
        subject: `New Support Ticket: ${subject}`,
        html: `
          <p>Hi Team,</p>
    
          <p><b>User Email:</b> ${user.email}</p>
          <p><b>Subject:</b> ${subject}</p>
          <p><b>Description:</b></p>
          <p>${description}</p>
        `,
        replyTo: user.email,
        file: req.file
      });
    
      // ✅ 2. AUTO REPLY TO USER
      await sendMail({
        to: user.email,
        subject: "We've received your request",
        html: `
          <p style="font-size:16px;">
            <strong>Subject:</strong> We've received your request
          </p>
      
          <br/>
      
          <p>Hi ${user.name || "User"},</p>
      
          <p>Thanks for reaching out to us. Our team will get back to you within 24 hours.</p>
      
          <br/>
          <p><strong>Team SOLO</strong></p>
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

  await ticket.save();

  // 🔥 BUILD FULL CONVERSATION HTML
  const conversation = ticket.replies
  .map((r) => {
    return `
      <div style="
        margin-top:10px;
        padding:12px;
        border-radius:8px;
        background:${r.sender === "ADMIN" ? "#e6f0f3" : "#f1f1f1"};
      ">
        <p style="margin:0; font-size:13px; color:#888;">
          ${r.sender === "ADMIN" ? "Support Team" : "You"}
        </p>
        <p style="margin:6px 0 0; font-size:15px; color:#333;">
          ${r.message}
        </p>
      </div>
    `;
  })
  .join("");  

  await sendMail({
    to: ticket.email,
    subject: `Re: ${ticket.subject}`,
    html: `
      <p style="font-size:16px;">
        <strong>Subject:</strong> ${ticket.subject}
      </p>
  
      <br/>
  
      <p>Hi ${ticket.userName || "User"},</p>
  
      <!-- 🔥 NEW MESSAGE -->
      <div style="
        margin-top:12px;
        padding:14px;
        background:#ffffff;
        border-left:4px solid #0b3c49;
        font-size:15px;
      ">
        ${message}
      </div>
  
      <br/>
  
      <!-- 🔥 HISTORY -->
      ${
        ticket.replies.length > 1
          ? `
          <div style="margin-top:25px;">
            <p style="font-weight:600; color:#444;">Previous conversation:</p>
            ${conversation}
          </div>
          `
          : ""
      }
  
      <br/>
      <p>Take care,<br/><strong>Team SOLO</strong></p>
    `
  }); 
};


exports.getUnreadCount = async (req, res) => {
  const count = await SupportTicket.countDocuments({
    unreadByAdmin: true
  });

  res.json({ count });
};