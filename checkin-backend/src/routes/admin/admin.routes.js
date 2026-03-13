const express = require("express");
const router = express.Router();

const adminAuth = require("../../middleware/admin.middleware");
const requireSuperAdmin = require("../../middleware/requireSuperAdmin");

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
  exportFullUsersPDF
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

const { getAlertMonitoring } =
require("../../controllers/adminpanel/adminAlertController");

const { getPushLogs } =
require("../../controllers/adminpanel/adminPushController");

const { forgotPassword } =
require("../../controllers/adminpanel/ForgotPasswordcontroller");

const { resetPassword } =
require("../../controllers/adminpanel/Resetpasswordcontroller");

const { getSystemHealth } =
require("../../controllers/adminpanel/adminSystem.controller");

const {
  getMyProfile,
  changePassword,
  getAllAdmins,
  deleteAdmin
} = require("../../controllers/adminpanel/admin.settings.controller");

const { getSMSLogs } =
require("../../controllers/adminpanel/adminSms.controller");

const {
  triggerTestMissedCheckin,
  triggerTestSOS
} = require("../../controllers/adminpanel/adminTest.controller");

/* ================= AUTH ================= */

router.post("/login", adminLogin);

/* ================= DASHBOARD ================= */

router.get("/dashboard", adminAuth, getDashboardSummary);

/* ================= USERS ANALYTICS ================= */

router.get("/users/dashboard", adminAuth, getUsersDashboard);

router.get("/users/regions", adminAuth, getUsersByRegion);

router.get("/users/top-countries", adminAuth, getTopCountries);

/* ================= USERS ================= */

router.get("/users", adminAuth, getUsers);

router.get("/users/:userId", adminAuth, getUserDetail);

router.get(
  "/users/export-full",
  adminAuth,
  requireSuperAdmin,
  exportFullUsersPDF
);

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

/* ================= ALERTS ================= */

router.get("/alerts", adminAuth, getAlerts);

router.get("/alert-monitoring", adminAuth, getAlertMonitoring);

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

module.exports = router;