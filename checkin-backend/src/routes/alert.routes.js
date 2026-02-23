const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");

const {
  getLatestAlert,
  getAlertHistory,
} = require("../controllers/alert.controller");

router.get("/latest", auth, getLatestAlert);
router.get("/history", auth, getAlertHistory);

module.exports = router;
