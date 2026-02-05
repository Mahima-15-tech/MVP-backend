const express = require("express");
const router = express.Router();

const { adminLogin } = require("../controllers/admin.auth.controller");
const { getUsers } = require("../controllers/admin.controller");
const adminAuth = require("../middleware/admin.middleware");
const { getDashboardStats } = require("../controllers/admin.controller");
const { getAlerts } = require("../controllers/admin.controller");


// auth
router.post("/login", adminLogin);

// protected admin APIs
router.get("/users", adminAuth, getUsers);
router.get("/dashboard", adminAuth, getDashboardStats);
router.get("/alerts", adminAuth, getAlerts);


module.exports = router;
