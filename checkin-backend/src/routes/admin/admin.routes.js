const express = require("express");
const router = express.Router();

const adminAuth = require("../../middleware/admin.middleware");
const { adminLogin } = require("../../controllers/adminpanel/admin.auth.controller");
const { getUsers, getAlerts, getCheckinLogs, banUser, unbanUser } = require("../../controllers/adminpanel/admin.controller");
const { getDashboardSummary } = require("../../controllers/adminpanel/adminDashboardController");
const { getAlertMonitoring } = require("../../controllers/adminpanel/adminAlertController");
const { getUserDetail } = require("../../controllers/adminpanel/adminUserDetailController");
const { getPushLogs } = require("../../controllers/adminpanel/adminPushController");


// auth
router.post("/login", adminLogin);

// protected admin APIs
router.get("/users", adminAuth, getUsers);  
router.get("/alerts", adminAuth, getAlerts);
router.get("/checkins", adminAuth, getCheckinLogs);
router.get("/dashboard", adminAuth, getDashboardSummary);
router.get("/alert-monitoring", adminAuth, getAlertMonitoring);

router.get("/users/:userId", adminAuth, getUserDetail);
router.get("/push-logs", adminAuth, getPushLogs);
router.patch("/ban/:userId", adminAuth, banUser);
router.patch("/unban/:userId", adminAuth, unbanUser);

module.exports = router;
