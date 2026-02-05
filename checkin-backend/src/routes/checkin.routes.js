const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const {
  createCheckin,
  getCheckinStatus,
  confirmCheckin,
  resumeCheckin,
} = require("../controllers/checkin.controller");

router.post("/", auth, createCheckin);
router.get("/status", auth, getCheckinStatus);
router.post("/confirm", auth, confirmCheckin);
router.post("/resume", auth, resumeCheckin);


module.exports = router;
