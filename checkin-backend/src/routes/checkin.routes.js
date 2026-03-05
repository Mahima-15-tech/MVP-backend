const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const {
  createCheckin,
  getCheckinStatus,
  confirmCheckin,
  getCheckinHistory,
  resumeCheckin,
  clearHistory,
} = require("../controllers/checkin.controller");

router.post("/", auth, createCheckin);
router.get("/status", auth, getCheckinStatus);
router.post("/confirm", auth, confirmCheckin);
router.get("/history", auth, getCheckinHistory);
router.post("/resume", auth, resumeCheckin);
router.delete("/history/clear", auth, clearHistory);


module.exports = router;
