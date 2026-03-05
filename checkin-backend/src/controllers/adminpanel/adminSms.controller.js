const SMSLog = require("../../models/SMSLog");

exports.getSMSLogs = async (req, res) => {
  try {

    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const logs = await SMSLog.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await SMSLog.countDocuments();

    res.json({
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};