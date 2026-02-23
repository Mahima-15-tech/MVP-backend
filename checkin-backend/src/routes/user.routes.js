const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");

const {
  updateProfile,
  updatePreferences,
  getProfile,
  updateLocation,
   deleteAccount ,
   saveDeviceToken,
   logoutUser,
   updateSmsConsent
} = require("../controllers/user.controller");

// 🔹 Profile
router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);

// 🔹 Preferences
router.put("/preferences", auth, updatePreferences);

// 🔹 Location
router.post("/location", auth, updateLocation);
router.post("/device-token", auth, saveDeviceToken);
router.post("/sms-consent", auth, updateSmsConsent);
router.post("/signout", auth, logoutUser);
router.delete("/", auth, deleteAccount);


module.exports = router;
