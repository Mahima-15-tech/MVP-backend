const express = require("express");
const router = express.Router();

const { createPromo, getPromos, redeemPromo  } = require("../controllers/promoController");

router.post("/create", createPromo);
router.get("/", getPromos);
router.post("/redeem", redeemPromo);

module.exports = router;