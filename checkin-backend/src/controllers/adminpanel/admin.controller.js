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


exports.getUsersDashboardUltra = async (req, res) => {
  try {
  
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const skip = (page - 1) * limit
  
  const search = req.query.search || ""
  
  let match = {}
  
  if(search){
  match.$or = [
  { name:{ $regex:search,$options:"i"} },
  { phone:{ $regex:search,$options:"i"} }
  ]
  }
  
  const usersPipeline = [
  
  { $match:match },
  
  { $sort:{ createdAt:-1 } },
  
  {
  $lookup:{
  from:"subscriptions",
  localField:"_id",
  foreignField:"userId",
  as:"subscription"
  }
  },
  
  {
  $lookup:{
  from:"alerts",
  localField:"_id",
  foreignField:"userId",
  as:"alerts"
  }
  },
  
  {
  $lookup:{
  from:"checkinschedules",
  localField:"_id",
  foreignField:"userId",
  as:"checkins"
  }
  },
  
  {
  $lookup:{
  from:"credittransactions",
  localField:"_id",
  foreignField:"userId",
  as:"credits"
  }
  },
  
  {
  $addFields:{
  
  plan:{ $arrayElemAt:["$subscription.planType",0] },
  
  renewal:{ $arrayElemAt:["$subscription.nextRenewalDate",0] },
  
  alertsSent:{ $size:"$alerts" },
  
  lastAlertType:{ $arrayElemAt:["$alerts.type",-1] },
  
  checkinTimes:{ $arrayElemAt:["$checkins.checkInTimes",0] },
  
  alertCredits:{
  $cond:[
  { $gt:[{ $size:"$credits"},0] },
  { $arrayElemAt:["$credits.balanceAfter",-1] },
  0
  ]
  }
  
  }
  
  },
  
  {
  $project:{
  
  userId:"$phone",
  
  name:1,
  
  joined:"$createdAt",
  
  plan:{
  $cond:[
  { $ifNull:["$plan",false] },
  "$plan",
  "NO PLAN"
  ]
  },
  
  renewal:1,
  
  alertCredits:1,
  
  checkinTimes:1,
  
  alertsSent:1,
  
  lastAlertType:1,
  
  status:{
  $cond:[
  { $eq:["$isBanned",true] },
  "BANNED",
  "ACTIVE"
  ]
  }
  
  }
  
  },
  
  {
  $facet:{
  
  data:[
  { $skip:skip },
  { $limit:limit }
  ],
  
  total:[
  { $count:"count" }
  ]
  
  }
  
  }
  
  ]
  
  const usersResult = await User.aggregate(usersPipeline)
  
  const usersData = usersResult[0].data
  const totalUsers = usersResult[0].total[0]?.count || 0
  
  /* STATS */
  
  const trialUsers = await Subscription.countDocuments({ planType:"TRIAL" })
  
  const activeSubscribers = await Subscription.countDocuments({ status:"ACTIVE" })
  
  const expiredCancelled = await Subscription.countDocuments({
  status:{ $in:["EXPIRED","CANCELLED"] }
  })
  
  const bannedUsers = await User.countDocuments({ isBanned:true })
  
  const pendingVerification = await User.countDocuments({ isVerified:false })
  
  /* CONTACTS */
  
  const contactsAgg = await EmergencyContact.aggregate([
  { $group:{ _id:"$userId"} }
  ])
  
  const usersWithContacts = contactsAgg.map(c=>c._id)
  
  const noContacts = await User.countDocuments({
  _id:{ $nin:usersWithContacts }
  })
  
  /* CREDITS */
  
  const creditsAgg = await CreditTransaction.aggregate([
  { $sort:{ createdAt:-1 }},
  {
  $group:{
  _id:"$userId",
  balance:{ $first:"$balanceAfter"}
  }
  }
  ])
  
  const lowCredits = creditsAgg.filter(c=>c.balance<2).length
  
  /* REGIONS */
  
  const regionsAgg = await User.aggregate([
  {
  $group:{
  _id:"$region",
  users:{ $sum:1 }
  }
  }
  ])
  
  const regions = {
  APAC:0,
  EMEA:0,
  LATAM:0,
  OTHER:0
  }
  
  regionsAgg.forEach(r=>{
  if(regions[r._id] !== undefined){
  regions[r._id] = r.users
  }else{
  regions.OTHER += r.users
  }
  })
  
  /* COUNTRIES */
  
  const countries = await User.aggregate([
  {
  $match:{ country:{ $nin:[null,""] } }
  },
  {
  $group:{
  _id:"$country",
  users:{ $sum:1 }
  }
  },
  { $sort:{ users:-1 }},
  { $limit:5 }
  ])
  
  res.json({
  
  stats:{
  totalUsers,
  trialUsers,
  activeSubscribers,
  expiredCancelled,
  bannedUsers,
  pendingVerification,
  noContacts,
  lowCredits
  },
  
  regions,
  countries,
  
  users:{
  page,
  limit,
  total:totalUsers,
  pages:Math.ceil(totalUsers/limit),
  data:usersData
  }
  
  })
  
  }catch(error){
  console.error(error)
  res.status(500).json({ message:error.message })
  }
  }

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

      const start = new Date(from);
      start.setHours(0,0,0,0);
    
      const end = new Date(to);
      end.setHours(23,59,59,999);
    
      filter.createdAt = {
        $gte: start,
        $lte: end
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