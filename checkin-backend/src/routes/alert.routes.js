const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");

const {
  getLatestAlert,
} = require("../controllers/alert.controller");

router.get("/latest", auth, getLatestAlert);

module.exports = router;
