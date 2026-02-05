const Checkin = require("../models/CheckinSchedule");

exports.createCheckin = async (req, res) => {
  const { checkInTime } = req.body;

  const checkin = await Checkin.create({
    userId: req.user.userId,
    checkInTime,
  });

  res.json(checkin);
};

exports.getCheckinStatus = async (req, res) => {
  const checkin = await Checkin.findOne({
    userId: req.user.userId,
  });

  res.json(checkin);
};

exports.confirmCheckin = async (req, res) => {
  const checkin = await Checkin.findOneAndUpdate(
    { userId: req.user.userId },
    { lastCheckInAt: new Date() },
    { new: true }
  );

  res.json({
    message: "Check-in confirmed",
    checkin,
  });
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
