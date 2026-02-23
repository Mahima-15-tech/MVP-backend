const PushLog = require("../../models/PushLog");

exports.getPushLogs = async (req, res) => {
  try {

    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const logs = await PushLog.find()
      .populate("userId", "name phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json(logs);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};