const Alert = require("../../models/Alert");

exports.getAlertMonitoring = async (req, res) => {
  try {

    const page = parseInt(req.query.page) || 1;
    const limit = 1000;
    const skip = (page - 1) * limit;

    const match = {};

    if(req.query.type && req.query.type !== "ALL"){
      match.type = req.query.type;
    }
    
    if(req.query.status && req.query.status !== "ALL"){
      match.status = req.query.status;
    }

    if(req.query.plan && req.query.plan !== "ALL"){
      match["subscription.planType"] = req.query.plan;
    }
    
    const search = req.query.search;

    if (search && search.trim() !== "") {
      match.$or = [
        { "user.name": { $regex: search, $options: "i" } },
        { "user.phone": { $regex: search, $options: "i" } }
      ];
    }

    console.log("REQ QUERY 👉", req.query);
console.log("MATCH 👉", match);

    const alerts = await Alert.aggregate([
      
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user"
        }
      },
      
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "subscriptions",
          localField: "userId",
          foreignField: "userId",
          as: "subscription"
        }
      },
      { $unwind: { path: "$subscription", preserveNullAndEmptyArrays: true } },

      { $match: match },

      {
        $lookup: {
          from: "credittransactions",
          localField: "userId",
          foreignField: "userId",
          as: "credits"
        }
      },

      {
        $addFields: {
          currentBalance: {
            $cond: {
              if: { $gt: [{ $size: "$credits" }, 0] },
              then: { $arrayElemAt: ["$credits.balanceAfter", -1] },
              else: 0
            }
          }
        }
      },

      {
        $lookup: {
          from: "emergencycontacts",
          localField: "userId",
          foreignField: "userId",
          as: "contacts"
        }
      },

      {
        $project: {
          userName: "$user.name",
          phone: "$user.phone",
          planType: "$subscription.planType",
          currentBalance: 1,
          alertType: "$type",
          status: 1,
          retryCount: 1,
          failureReason: 1,
          lastAttemptAt: 1,
          location: 1,
          contactsCount: { $size: "$contacts" },
          createdAt: 1
        }
      },

      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }

    ]);

    console.log("ALERTS COUNT 👉", alerts.length);

    res.json(alerts);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAlertStats = async (req, res) => {
  try {

    const match = {};

    if (req.query.type && req.query.type !== "ALL") {
      match.type = req.query.type;
    }

    if (req.query.status && req.query.status !== "ALL") {
      match.status = req.query.status;
    }

    const search = req.query.search;

    if (search && search.trim() !== "") {
      match.$or = [
        { "user.name": { $regex: search, $options: "i" } },
        { "user.phone": { $regex: search, $options: "i" } }
      ];
    }

    // ✅ DIRECT ALERT COLLECTION PAR KAAM KARO (NO LOOKUP NEEDED)

    const statsData = await Alert.aggregate([
      { $match: match },
    
      {
        $group: {
          _id: null,
    
          totalAlerts: { $sum: 1 },
    
          smsSent: {
            $sum: { $cond: [{ $eq: ["$status", "SMS_SENT"] }, 1, 0] }
          },
    
          smsPending: {
            $sum: { $cond: [{ $eq: ["$status", "SMS_PENDING"] }, 1, 0] }
          },
    
          smsFailed: {
            $sum: { $cond: [{ $eq: ["$status", "FAILED"] }, 1, 0] }
          },
    
          missedSent: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$type", "MISSED_CHECKIN"] },
                    { $eq: ["$status", "SMS_SENT"] }
                  ]
                },
                1,
                0
              ]
            }
          },
    
          sosSent: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$type", "SOS"] },
                    { $eq: ["$status", "SMS_SENT"] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);
    
    const data = statsData[0] || {};
    
    res.json({
      usersTriggered: data.totalAlerts || 0, // 👈 bas yahi change
      smsSent: data.smsSent || 0,
      smsPending: data.smsPending || 0,
      smsFailed: data.smsFailed || 0,
      missedSent: data.missedSent || 0,
      sosSent: data.sosSent || 0
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};