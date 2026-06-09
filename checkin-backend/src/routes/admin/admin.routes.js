const express = require("express");
const router = express.Router();

const AppSettings = require("../../models/AppSettings");
const adminAuth = require("../../middleware/admin.middleware");
const requireSuperAdmin = require("../../middleware/requireSuperAdmin");
const { refundPayment } = require("../../controllers/stripeController");

/* ================= CONTROLLERS ================= */

const {
  adminLogin,
  createAdmin
} = require("../../controllers/adminpanel/admin.auth.controller");

const {
  getUsers,
  getAlerts,
  getCheckinLogs,
  banUser,
  unbanUser,
  exportFullUsersPDF,
  exportUsersCSV,
  getUsersDashboardFull,
  getUsersDashboardUltra
} = require("../../controllers/adminpanel/admin.controller");

const {
  getUserDetail,
  addAdminNote,
  adjustUserCredits,
  toggleUserCheckin,
  getUsersDashboard,
  getUsersByRegion,
  getTopCountries
} = require("../../controllers/adminpanel/adminUserDetailController");

const { getDashboardSummary } =
require("../../controllers/adminpanel/adminDashboardController");

const { getAlertMonitoring, getAlertStats } =
require("../../controllers/adminpanel/adminAlertController");

const { getPushLogs } =
require("../../controllers/adminpanel/adminPushController");

const { forgotPassword } =
require("../../controllers/adminpanel/ForgotPasswordcontroller");

const { resetPassword } =
require("../../controllers/adminpanel/Resetpasswordcontroller");

const { getSystemHealth } =
require("../../controllers/adminpanel/adminSystem.controller");




// const { getSMSLogs } = require("../controllers/admin/adminsmscontroller");






const {
  getMyProfile,
  changePassword,
  getAllAdmins,
  updateProfile,
  getPasswordHistory,
  deleteAdmin
} = require("../../controllers/adminpanel/admin.settings.controller");

const { getSMSLogs } =
require("../../controllers/adminpanel/adminSms.controller");

const {
  triggerTestMissedCheckin,
  triggerTestSOS
} = require("../../controllers/adminpanel/adminTest.controller");


const { getRevenue,getRefundHistory } = require("../../controllers/adminpanel/adminRevenueController");

/* ================= AUTH ================= */

router.post("/login", adminLogin);

router.put("/me", adminAuth, updateProfile);

router.get("/password-history", adminAuth, getPasswordHistory);

/* ================= DASHBOARD ================= */

router.get("/dashboard", adminAuth, getDashboardSummary);

/* ================= USERS ANALYTICS ================= */

router.get("/users/dashboard", adminAuth, getUsersDashboard);

router.get("/users/regions", adminAuth, getUsersByRegion);

router.get("/users/top-countries", adminAuth, getTopCountries);

/* ================= USERS ================= */

router.get(
  "/users/dashboard-ultra",
  adminAuth,
  getUsersDashboardUltra
);



router.get("/users", adminAuth, getUsers);


router.get("/users/export-csv", adminAuth, exportUsersCSV);

router.get(
  "/users/export-full",
  adminAuth,
  requireSuperAdmin,
  exportFullUsersPDF
);

router.get("/users/:userId", adminAuth, getUserDetail);




router.patch(
  "/users/:userId/ban",
  adminAuth,
  requireSuperAdmin,
  banUser
);

router.patch(
  "/users/:userId/unban",
  adminAuth,
  requireSuperAdmin,
  unbanUser
);

router.patch(
  "/users/:userId/toggle-checkin",
  adminAuth,
  toggleUserCheckin
);

router.post(
  "/users/:userId/adjust-credits",
  adminAuth,
  requireSuperAdmin,
  adjustUserCredits
);

router.post(
  "/users/:userId/notes",
  adminAuth,
  addAdminNote
);

router.post("/refund", refundPayment);

/* ================= ALERTS ================= */

router.get("/alerts", adminAuth, getAlerts);

router.get("/alert-monitoring", adminAuth, getAlertMonitoring);
router.get("/alert-stats",adminAuth, getAlertStats);

/* ================= CHECKINS ================= */

router.get("/checkins", adminAuth, getCheckinLogs);

/* ================= PUSH LOGS ================= */

router.get("/push-logs", adminAuth, getPushLogs);

/* ================= ADMIN MANAGEMENT ================= */

router.post(
  "/admins",
  adminAuth,
  requireSuperAdmin,
  createAdmin
);

router.get("/sms-tracker", getSMSLogs);

router.get(
  "/admins",
  adminAuth,
  requireSuperAdmin,
  getAllAdmins
);

router.delete(
  "/admins/:adminId",
  adminAuth,
  requireSuperAdmin,
  deleteAdmin
);

/* ================= SETTINGS ================= */

router.get("/me", adminAuth, getMyProfile);

router.post("/change-password", adminAuth, changePassword);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPassword);

/* ================= SYSTEM ================= */

router.get(
  "/system-health",
  adminAuth,
  requireSuperAdmin,
  getSystemHealth
);

router.get(
  "/sms-logs",
  adminAuth,
  requireSuperAdmin,
  getSMSLogs
);

/* ================= TEST ROUTES ================= */

router.post(
  "/test/missed-checkin",
  adminAuth,
  requireSuperAdmin,
  triggerTestMissedCheckin
);

router.post(
  "/test/sos",
  adminAuth,
  requireSuperAdmin,
  triggerTestSOS
);


//revenue

router.get("/revenue",adminAuth, getRevenue);

router.get("/refund-history", getRefundHistory);

// routes/admin.js
router.post("/set-commission", async (req, res) => {
  try {
    const { commission } = req.body;

    let settings = await AppSettings.findOne();

    if (!settings) {
      settings = new AppSettings({ commission });
    } else {
      settings.commission = commission;
    }

    await settings.save();

    res.json({ message: "Commission updated" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/get-commission", async (req, res) => {
  try {
    const settings = await AppSettings.findOne();
    res.json({
      commission: settings?.commission || 15
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;