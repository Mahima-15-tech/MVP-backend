const SMSLog = require("../../models/SMSLog");
const EmergencyContact = require("../../models/EmergencyContact");
const Alert = require("../../models/Alert");

exports.getSMSLogs = async (req, res) => {
  try {
    const { search, consent, status, page = 1 } = req.query;

    const limit = 5;
    const skip = (page - 1) * limit;
    
    

    let query = {};

    // ✅ SEARCH (name + phone)
    if (search) {
      query.$or = [
        { recipientName: { $regex: search, $options: "i" } },
        { recipientNumber: { $regex: search, $options: "i" } }
      ];
    }


    // ✅ STATUS FILTER
if (status && status !== "ALL") {
  query.status = status.toUpperCase();
}

// ✅ 24h FILTER (FIXED)
if (req.query.range === "24h") {
  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  query.createdAt = {
    $gte: last24h,
    $lte: now
  };
}

const logs = await SMSLog.find(query)
.sort({ createdAt: -1 })
.skip(skip)
.limit(limit);
    const formatted = [];

    for (let log of logs) {

      const contact = await EmergencyContact.findOne({
        phone: log.recipientNumber
      });
    
      const consentMap = {
        "Opted In": "OPTED_IN",
        "Opted Out": "OPTED_OUT",
        "Pending": "PENDING"
      };
    
      

      // ✅ APPLY FILTER
      if (consent && consent !== "ALL") {
        const required = consentMap[consent];
      
        if (contact?.consentStatus !== required) {
          continue;
        }
      
      
      
      
      
      }
      formatted.push({
        name: log.recipientName,
        phone: log.recipientNumber,

        consent:
          contact?.consentStatus === "OPTED_IN"
            ? "Opted In"
            : contact?.consentStatus === "OPTED_OUT"
            ? "Blocked"
            : "Pending",

        alertType:
          log.type === "SOS_ALERT"
            ? "SOS"
            : log.type === "MISSED_ALERT"
            ? "MISSED"
            : log.type === "CONSENT"
            ? "CONSENT"
            : "-",

        createdAt: log.createdAt,

        status:
          contact?.consentStatus === "OPTED_OUT"
            ? "BLOCKED"
            : log.status,

        retryCount: log.retryCount || 1,

        failureReason: log.failureReason || null
      });
    }

    const total = await SMSLog.countDocuments(query);

    res.json({
      data: formatted,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getSMSStats = async (req, res) => {
  try {

    let matchStage = {};

// ✅ range filter
if (req.query.range === "24h") {
  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  matchStage.createdAt = {
    $gte: last24h,
    $lte: now
  };
}

// ✅ status filter (IMPORTANT)
if (req.query.status && req.query.status !== "ALL") {
  matchStage.status = req.query.status.toUpperCase();
}

    const stats = await SMSLog.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          sent: { $sum: { $cond: [{ $eq: ["$status", "SENT"] }, 1, 0] }},
          pending: { $sum: { $cond: [{ $eq: ["$status", "PENDING"] }, 1, 0] }},
          failed: { $sum: { $cond: [{ $eq: ["$status", "FAILED"] }, 1, 0] }}
        }
      }
    ]);

    const data = stats[0] || {};

    res.json({
      total: data.total || 0,
      sent: data.sent || 0,
      pending: data.pending || 0,
      failed: data.failed || 0
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


