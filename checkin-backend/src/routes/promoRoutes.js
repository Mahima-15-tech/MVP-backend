const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");

const { createPromo, getPromos, redeemPromo  } = require("../controllers/promoController");

router.post("/create", createPromo);
router.get("/", getPromos);
router.post("/redeem",auth, redeemPromo);


module.exports = router;