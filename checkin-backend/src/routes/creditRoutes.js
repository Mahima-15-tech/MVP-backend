const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");

const {
  getBalance,
  testDeduct
} = require("../controllers/creditTestController");

router.get("/balance",auth, getBalance);
router.post("/deduct",  auth, testDeduct);

module.exports = router;
