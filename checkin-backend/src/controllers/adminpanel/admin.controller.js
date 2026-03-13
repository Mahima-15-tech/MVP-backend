const User = require("../../models/User");
const CheckinSchedule = require("../../models/CheckinSchedule");
const Alert = require("../../models/Alert");
const PhoneRegistry = require("../../models/PhoneRegistry");
const Subscription = require("../../models/subscription");
const CreditTransaction = require("../../models/creditTransaction");
const EmergencyContact = require("../../models/EmergencyContact");
const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");

exports.getDashboardStats = async (req, res) => {
  const totalUsers = await User.countDocuments();
  const activeCheckins = await CheckinSchedule.countDocuments({ status: "ACTIVE" });
  const pausedCheckins = await CheckinSchedule.countDocuments({ status: "PAUSED" });
  const alertsToday = await Alert.countDocuments({
    createdAt: { $gte: new Date().setHours(0, 0, 0, 0) },
  });

  res.json({
    totalUsers,
    activeCheckins,
    pausedCheckins,
    alertsToday,
  });
};

exports.getUsers = async (req, res) => {
  try {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const from = req.query.from;
    const to = req.query.to;

    const skip = (page - 1) * limit;

    let filter = {};

    /* -------- SEARCH -------- */

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } }
      ];
    }

    /* -------- DATE FILTER -------- */

    if (from && to) {
      filter.createdAt = {
        $gte: new Date(from),
        $lte: new Date(to + "T23:59:59.999Z")
      };
    }

    /* -------- USERS -------- */

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await User.countDocuments(filter);

    /* -------- SUBSCRIPTIONS -------- */

    const userIds = users.map(u => u._id);

    const subscriptions = await Subscription.find({
      userId: { $in: userIds }
    });

    const alerts = await Alert.aggregate([
      {
        $match: { userId: { $in: userIds } }
      },
      {
        $group: {
          _id: "$userId",
          alerts: { $sum: 1 }
        }
      }
    ]);

    const credits = await CreditTransaction.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$userId",
          balance: { $first: "$balanceAfter" }
        }
      }
    ]);

    const creditMap = {};
    credits.forEach(c => creditMap[c._id] = c.balance);

    const alertMap = {};
    alerts.forEach(a => alertMap[a._id] = a.alerts);

    const data = users.map(u => {

      const subscription = subscriptions.find(s =>
        s.userId.toString() === u._id.toString()
      );

      return {
        userId: u.phone,
        name: u.name,
        joined: u.createdAt,
        plan: subscription?.planType || "Trial",
        renewal: subscription?.renewalDate || "-",
        alertCredits: creditMap[u._id] || 0,
        alertsSent: alertMap[u._id] || 0,
        status: u.isBanned ? "Banned" : "Active"
      };

    });

    res.json({
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      data
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find()
      .populate("userId", "name phone lastKnownLocation")
      .sort({ createdAt: -1 });

    res.json(alerts);
  } catch (error) {
    console.error("Get alerts error:", error);
    res.status(500).json({ message: "Failed to fetch alerts" });
  }
};

const { Parser } = require("json2csv");

exports.exportUsersCSV = async (req, res) => {

  const users = await User.find();

  const fields = [
    "name",
    "phone",
    "email",
    "createdAt"
  ];

  const parser = new Parser({ fields });

  const csv = parser.parse(users);

  res.header("Content-Type", "text/csv");
  res.attachment("users.csv");

  return res.send(csv);
};
    

exports.getCheckinLogs = async (req, res) => {
  try {

    const { status, search } = req.query;

    let matchStage = {};

    if (status && status !== "ALL") {
      matchStage.status = status;
    }

    const data = await CheckinSchedule.aggregate([

      { $match: matchStage },

      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },

      ...(search ? [{
        $match: {
          "user.phone": { $regex: search, $options: "i" }
        }
      }] : []),

      {
        $lookup: {
          from: "subscriptions",
          localField: "userId",
          foreignField: "userId",
          as: "subscription"
        }
      },
      { $unwind: { path: "$subscription", preserveNullAndEmptyArrays: true } },

      {
        $project: {
          userName: "$user.name",
          phone: "$user.phone",
          planType: "$subscription.planType",
          checkInTimes: 1,
          graceMinutes: 1,
          lastCheckInAt: 1,
          status: 1,
          createdAt: 1
        }
      },

      { $sort: { createdAt: -1 } }

    ]);

    res.json(data);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.exportFullUsersPDF = async (req, res) => {
  try {
    const { from, to } = req.query;

    /* ---------------- DATE FILTER ---------------- */

    let filter = {};
    if (from && to) {
      filter.createdAt = {
        $gte: new Date(from),
        $lte: new Date(to + "T23:59:59.999Z"),
      };
    }

    const users = await User.find(filter).sort({ createdAt: -1 });

    const totalUsers = users.length;
    const activeUsers = users.filter(u => !u.isBanned).length;
    const bannedUsers = users.filter(u => u.isBanned).length;

    /* ---------------- FETCH ALL RELATED DATA (NO N+1) ---------------- */

    const userIds = users.map(u => u._id);

    const subscriptions = await Subscription.find({
      userId: { $in: userIds }
    });

    const credits = await CreditTransaction.find({
      userId: { $in: userIds }
    });

    const alerts = await Alert.find({
      userId: { $in: userIds }
    });

    const contacts = await EmergencyContact.find({
      userId: { $in: userIds }
    });

    /* ---------------- PDF INIT ---------------- */

    const doc = new PDFDocument({
      margin: 40,
      size: "A4",
      bufferPages: true
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Enterprise-User-Report.pdf"
    );

    doc.pipe(res);

    /* ---------------- HEADER ---------------- */

    const logoPath = path.join(__dirname, "../../public/logo.png");

    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 40, 30, { width: 80 });
    }

    doc
      .fontSize(20)
      .text("Company Admin User Report", 150, 40);

    doc
      .fontSize(10)
      .text(`Generated On: ${new Date().toDateString()}`, 150, 65);

    if (from && to) {
      doc.text(`Date Range: ${from} to ${to}`, 150, 80);
    }

    doc.moveDown(5);

    /* ---------------- SUMMARY ---------------- */

    doc.fontSize(16).text("Summary", { underline: true });
    doc.moveDown(1);

    doc.fontSize(12)
      .text(`Total Users: ${totalUsers}`)
      .text(`Active Users: ${activeUsers}`)
      .text(`Banned Users: ${bannedUsers}`);

    doc.addPage();

    /* ---------------- TABLE HEADER ---------------- */

    let tableTop = 60;

    doc.fontSize(14).text("User Details", 40, 30);

    doc.fontSize(9);

    const headers = [
      "Name",
      "Phone",
      "Plan",
      "Credits",
      "Contacts",
      "Alerts",
      "Status"
    ];

    const columnPositions = [40, 120, 200, 260, 310, 380, 440];

    headers.forEach((header, i) => {
      doc.text(header, columnPositions[i], tableTop);
    });

    let rowY = tableTop + 20;

    /* ---------------- TABLE DATA ---------------- */

    for (const user of users) {

      const subscription = subscriptions.find(s =>
        s.userId.toString() === user._id.toString()
      );

      const userCredits = credits.filter(c =>
        c.userId.toString() === user._id.toString()
      );

      const userAlerts = alerts.filter(a =>
        a.userId.toString() === user._id.toString()
      );

      const userContacts = contacts.filter(c =>
        c.userId.toString() === user._id.toString()
      );

      const contactNames = userContacts.map(c => c.name).join(", ");

      const row = [
        user.name || "Unnamed",
        user.phone || "-",
        subscription ? subscription.planType : "No Plan",
        userCredits.length,
        contactNames || "None",
        userAlerts.length,
        user.isBanned ? "BANNED" : "ACTIVE"
      ];

      row.forEach((text, i) => {
        doc.text(String(text), columnPositions[i], rowY, {
          width: 70
        });
      });

      rowY += 25;

      /* ---- Auto Page Break ---- */

      if (rowY > 750) {
        doc.addPage();
        rowY = 60;

        headers.forEach((header, i) => {
          doc.text(header, columnPositions[i], rowY);
        });

        rowY += 20;
      }
    }

    /* ---------------- PAGE NUMBERS ---------------- */

    const pageRange = doc.bufferedPageRange();

    for (let i = 0; i < pageRange.count; i++) {
      doc.switchToPage(i);

      doc
        .fontSize(9)
        .text(
          `Page ${i + 1} of ${pageRange.count}`,
          0,
          820,
          { align: "center" }
        );
    }

    doc.end();

  } catch (error) {
    console.error("Enterprise PDF error:", error);

    if (!res.headersSent) {
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  }
};

exports.getAllTickets = async (req, res) => {
  const tickets = await SupportTicket.find()
    .populate("userId", "name phone")
    .sort({ createdAt: -1 });

  res.json(tickets);
};



exports.banUser = async (req, res) => {
  const { userId } = req.params;
  const { reason } = req.body;

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.isBanned = true;
  user.bannedAt = new Date();
  user.banReason = reason || "Policy violation";

  await user.save();

  res.json({ message: "User banned successfully" });
};

exports.unbanUser = async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.isBanned = false;
  user.bannedAt = null;
  user.banReason = null;

  await user.save();

  res.json({ message: "User unbanned successfully" });
};