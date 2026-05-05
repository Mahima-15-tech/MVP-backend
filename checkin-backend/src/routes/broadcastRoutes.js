const express = require("express");
const router = express.Router();

const {
  sendBroadcast,
  getBroadcasts,
} = require("../controllers/adminpanel/broadcastController");

router.post("/send", sendBroadcast);
router.get("/", getBroadcasts);

module.exports = router;