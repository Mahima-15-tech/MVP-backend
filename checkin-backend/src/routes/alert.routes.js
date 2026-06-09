const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const { triggerSOS } = require("../controllers/alert.controller");

const {
  getLatestAlert,
  getAlertHistory,
  initSOS,
  confirmSOS,
  cancelSOS
} = require("../controllers/alert.controller");

router.get("/latest", auth, getLatestAlert);
router.get("/history", auth, getAlertHistory);
router.post("/sos/init", auth, initSOS);
router.post("/sos/confirm", auth, confirmSOS);
router.post("/sos/cancel", auth, cancelSOS);
router.post("/sos", auth, triggerSOS);


module.exports = router;
