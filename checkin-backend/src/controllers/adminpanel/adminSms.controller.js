const SMSLog = require("../../models/SMSLog");
const EmergencyContact = require("../../models/EmergencyContact");
const Alert = require("../../models/Alert");

exports.getSMSLogs = async (req, res) => {
  try {
    const { search, consent, status, page = 1 } = req.query;

    const limit = 10;
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

    const logs = await SMSLog.find(query)
    .sort({ createdAt: -1 });
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