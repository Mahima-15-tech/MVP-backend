const Checkin = require("../models/CheckinSchedule");
const Alert = require("../models/Alert");
const CheckinLog = require("../models/CheckinLog");

exports.createCheckin = async (req, res) => {

  const { checkInTimes } = req.body;

  const existing = await Checkin.findOne({
    userId: req.user.userId
  });

  if (existing) {
    existing.checkInTimes = checkInTimes;
    await existing.save();
    return res.json(existing);
  }

  const checkin = await Checkin.create({
    userId: req.user.userId,
    checkInTimes
  });

  res.json(checkin);
};


exports.getCheckinStatus = async (req, res) => {
  const checkin = await Checkin.findOne({
    userId: req.user.userId,
  });

  res.json(checkin);
};

// const CheckinLog = require("../models/CheckinLog");

exports.confirmCheckin = async (req, res) => {

  const checkin = await Checkin.findOne({
    userId: req.user.userId,
  });

  if (!checkin) {
    return res.status(404).json({ message: "Check-in not found" });
  }

  const now = new Date();

  await CheckinLog.create({
    userId: req.user.userId,
    scheduledTime: new Date(),
    checkedAt: now,
    status: "CHECKED_IN"
  });

  checkin.lastCheckInAt = now;

  await checkin.save();

  res.json({
    message: "Check-in confirmed successfully",
  });
};

exports.getCheckinHistory = async (req, res) => {

  const logs = await CheckinLog.find({
    userId: req.user.userId
  })
  .sort({ createdAt: -1 })
  .limit(50);

  res.json(logs);
};


exports.resumeCheckin = async (req, res) => {
  const checkin = await Checkin.findOne({
    userId: req.user.userId,
  });

  if (!checkin) {
    return res.status(404).json({ message: "Check-in not found" });
  }

  if (checkin.status !== "PAUSED") {
    return res.status(400).json({
      message: "Check-in is not paused",
    });
  }

  checkin.status = "ACTIVE";
  checkin.lastCheckInAt = null; // fresh start
  await checkin.save();

  res.json({
    message: "Check-in resumed successfully",
    checkin,
  });
};


exports.clearHistory = async (req, res) => {

  const userId = req.user.userId;

  await Alert.deleteMany({ userId });
  await CheckinLog.deleteMany({ userId });

  res.json({
    message: "History cleared successfully"
  });
};