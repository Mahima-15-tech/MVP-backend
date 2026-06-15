const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");

const { createPromo, getPromos, redeemPromo,  getPromoStats  } = require("../controllers/promoController");

router.post("/create", createPromo);
router.get("/", getPromos);
router.post("/redeem",auth, redeemPromo);
router.get("/stats", getPromoStats);

module.exports = router;