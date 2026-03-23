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

      const start = new Date(from);
      start.setHours(0,0,0,0);
    
      const end = new Date(to);
      end.setHours(23,59,59,999);
    
      filter.createdAt = {
        $gte: start,
        $lte: end
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

  const from = req.query.from;
const to = req.query.to;

if (from && to) {
  const start = new Date(from);
  start.setHours(0,0,0,0);

  const end = new Date(to);
  end.setHours(23,59,59,999);

  match.createdAt = {
    $gte: start,
    $lte: end
  };
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
  
  const pendingVerification = await User.countDocuments({
    isVerified: true,
    $or: [
      { nameCompleted: false },
      { emailCompleted: false }
    ]
  });
  
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
  { $limit:4 }
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

  const users = await User.find().lean();

  const userIds = users.map(u => u._id);

  const subscriptions = await Subscription.find({ userId: { $in: userIds } });
  const alerts = await Alert.aggregate([
    { $match: { userId: { $in: userIds } } },
    { $group: { _id: "$userId", count: { $sum: 1 } } }
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

  const contacts = await EmergencyContact.aggregate([
    { $group: { _id: "$userId", count: { $sum: 1 } } }
  ]);

  // maps
  const subMap = {};
  subscriptions.forEach(s => subMap[s.userId] = s);

  const alertMap = {};
  alerts.forEach(a => alertMap[a._id] = a.count);

  const creditMap = {};
  credits.forEach(c => creditMap[c._id] = c.balance);

  const contactMap = {};
  contacts.forEach(c => contactMap[c._id] = c.count);

  const finalData = users.map(u => {

    const sub = subMap[u._id];

    return {
      Name: u.name,
      Phone: u.phone,
      Email: u.email,
      Joined: u.createdAt,

      Plan: sub?.planType || "NO PLAN",
      Status: u.isBanned ? "BANNED" : "ACTIVE",

      Credits: creditMap[u._id] || 0,
      AlertsSent: alertMap[u._id] || 0,
      Contacts: contactMap[u._id] || 0,

      Region: u.region,
      Country: u.country
    };
  });

  const parser = new Parser();
  const csv = parser.parse(finalData);

  res.header("Content-Type", "text/csv");
  res.attachment("users-full.csv");

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

    /* -------- DATE FILTER -------- */
    let filter = {};

    if (from && to) {
      const start = new Date(from);
      start.setHours(0,0,0,0);

      const end = new Date(to);
      end.setHours(23,59,59,999);

      filter.createdAt = { $gte: start, $lte: end };
    }

    const users = await User.find(filter).sort({ createdAt: -1 });

    const userIds = users.map(u => u._id);

    const subscriptions = await Subscription.find({ userId: { $in: userIds } });
    const credits = await CreditTransaction.find({ userId: { $in: userIds } });
    const alerts = await Alert.find({ userId: { $in: userIds } });
    const contacts = await EmergencyContact.find({ userId: { $in: userIds } });

    /* -------- PDF INIT -------- */
    const doc = new PDFDocument({
      margin: 30,
      size: "A4",
      layout: "landscape",
      bufferPages: true   // ✅ ADD THIS
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=User-Report.pdf"
    );

    doc.pipe(res);

    /* -------- HEADER -------- */
    doc
      .fontSize(22)
      .fillColor("#002c3e")
      .text("User Report", 40, 30);

    doc
      .fontSize(10)
      .fillColor("#6b7280")
      .text(`Generated: ${new Date().toDateString()}`, 40, 60);

    if (from && to) {
      doc.text(`Date Range: ${from} to ${to}`, 40, 75);
    }

    /* -------- TABLE SETUP -------- */
    let startX = 40;
    let rowY = 110;

    const colWidths = [120, 100, 160, 100, 100, 90, 80, 80, 80, 80, 100];

    const headers = [
      "Name", "Phone", "Email", "Joined",
      "Plan", "Status", "Credits",
      "Alerts", "Contacts", "Region", "Country"
    ];

    /* -------- HEADER BG -------- */
    doc.rect(startX, rowY, 850, 25).fill("#002c3e");

    doc.fillColor("#ffffff").fontSize(10);

    let x = startX;

    headers.forEach((h, i) => {
      doc.text(h, x + 5, rowY + 7, {
        width: colWidths[i],
        ellipsis: true
      });
      x += colWidths[i];
    });

    rowY += 30;

    /* -------- ROWS -------- */
    doc.fontSize(9);

    let rowIndex = 0;

    for (const user of users) {

      const subscription = subscriptions.find(s =>
        s.userId.toString() === user._id.toString()
      );

      const credit = credits.find(c =>
        c.userId.toString() === user._id.toString()
      );

      const alertCount = alerts.filter(a =>
        a.userId.toString() === user._id.toString()
      ).length;

      const contactCount = contacts.filter(c =>
        c.userId.toString() === user._id.toString()
      ).length;

      const row = [
        user.name || "Unnamed",
        user.phone || "-",
        user.email || "-",
        new Date(user.createdAt).toLocaleDateString(),

        subscription?.planType || "NO PLAN",
        user.isBanned ? "BANNED" : "ACTIVE",

        credit?.balanceAfter || 0,
        alertCount,
        contactCount,

        user.region || "-",
        user.country || "-"
      ];

      // zebra background
      if (rowIndex % 2 === 0) {
        doc.rect(startX, rowY, 850, 22).fill("#f5f5f5");
      }

      let x = startX;
      doc.fillColor("#000000");

      row.forEach((text, i) => {
        doc.text(String(text), x + 5, rowY + 5, {
          width: colWidths[i],
          ellipsis: true
        });
        x += colWidths[i];
      });

      rowY += 22;
      rowIndex++;

      /* ---- PAGE BREAK ---- */
      if (rowY > 550) {
        doc.addPage();
        rowY = 80;
      }
    }

    /* -------- PAGE NUMBER -------- */
    const pageRange = doc.bufferedPageRange();

    for (let i = 0; i < pageRange.count; i++) {
      doc.switchToPage(i);

      doc
        .fontSize(9)
        .fillColor("#6b7280")
        .text(
          `Page ${i + 1} of ${pageRange.count}`,
          0,
          570,
          { align: "center" }
        );
    }

    doc.end();

  } catch (error) {
    console.error("PDF error:", error);

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