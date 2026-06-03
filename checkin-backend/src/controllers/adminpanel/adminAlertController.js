const Alert = require("../../models/Alert");

exports.getAlertMonitoring = async (req, res) => {
  try {

    const page = parseInt(req.query.page) || 1;
    const limit = 20;
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
    
    if (search) {
      match.$or = [
        { "user.name": { $regex: search, $options: "i" } },
        { "user.phone": { $regex: search, $options: "i" } }
      ];
    }

    const alerts = await Alert.aggregate([
      
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user"
        }
      },
      
      { $unwind: "$user" },

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

    res.json(alerts);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};