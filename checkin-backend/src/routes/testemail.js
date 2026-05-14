const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");

const { createPromo, getPromos, redeemPromo  } = require("../controllers/promoController");

router.post("/create", createPromo);
router.get("/", getPromos);
router.post("/redeem",auth, redeemPromo);
// routes/testEmail.js

const sendEmail = require("../../utils/sendEmail");

router.get("/test-email", async (req, res) => {
  const preview = await sendEmail(
    "test@test.com",
    "TEST123",
    "1 Month",
    `Hi there,

Use this code:
[CODE]

Valid for [DURATION]`
  );

  res.json({
    success: true,
    preview
  });
});

module.exports = router;

module.exports = router;