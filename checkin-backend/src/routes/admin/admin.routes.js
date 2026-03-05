const express = require("express");
const router = express.Router();

const adminAuth = require("../../middleware/admin.middleware");
const requireSuperAdmin = require("../../middleware/requireSuperAdmin");

/* ================= CONTROLLERS ================= */

const { adminLogin, createAdmin } = require("../../controllers/adminpanel/admin.auth.controller");

const {
  getUsers,
  getAlerts,
  getCheckinLogs,
  banUser,
  unbanUser,
  exportFullUsersPDF
} = require("../../controllers/adminpanel/admin.controller");

const { getDashboardSummary } = require("../../controllers/adminpanel/adminDashboardController");

const { getAlertMonitoring } = require("../../controllers/adminpanel/adminAlertController");

const {
  getUserDetail,
  addAdminNote,
  adjustUserCredits,
  toggleUserCheckin
} = require("../../controllers/adminpanel/adminUserDetailController");

const { getPushLogs } = require("../../controllers/adminpanel/adminPushController");

const { forgotPassword } = require("../../controllers/adminpanel//ForgotPasswordcontroller");

const { resetPassword } = require("../../controllers/adminpanel/Resetpasswordcontroller");

const {getSystemHealth } = require("../../controllers/adminpanel/adminSystem.controller");

const {
    getMyProfile,
    changePassword,
    getAllAdmins,
    deleteAdmin
  } = require("../../controllers/adminpanel/admin.settings.controller");

  const { getSMSLogs } = require("../../controllers/adminpanel/adminSms.controller");


  const { triggerTestMissedCheckin , triggerTestSOS  } = require("../../controllers/adminpanel/adminTest.controller");

/* ================= AUTH ================= */

// Public
router.post("/login", adminLogin);

/* ================= DASHBOARD ================= */

router.get("/dashboard", adminAuth, getDashboardSummary);

/* ================= USERS ================= */

// View users
router.get("/users", adminAuth, getUsers);

// Export users (Sensitive → Super Admin Only)
router.get(
  "/users/export-full",
  adminAuth,
  requireSuperAdmin,
  exportFullUsersPDF
);

// User detail
router.get("/users/:userId", adminAuth, getUserDetail);

// Ban / Unban (Super Admin Only recommended)
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

// Toggle Check-in
router.patch(
  "/users/:userId/toggle-checkin",
  adminAuth,
  toggleUserCheckin
);

// Adjust credits (Super Admin Only recommended)
router.post(
  "/users/:userId/adjust-credits",
  adminAuth,
  requireSuperAdmin,
  adjustUserCredits
);

// Add internal note
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

/* ================= ADMIN MANAGEMENT (Future Ready) ================= */

// Create new admin (Super Admin Only)
router.post(
  "/admins",
  adminAuth,
  requireSuperAdmin,
  createAdmin
);

/* ================= SETTINGS ================= */

router.get("/me", adminAuth, getMyProfile);

router.post("/change-password", adminAuth, changePassword);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get(
  "/admins",
  adminAuth,
  requireSuperAdmin,
  getAllAdmins
);

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

router.delete(
  "/admins/:adminId",
  adminAuth,
  requireSuperAdmin,
  deleteAdmin
);

module.exports = router;