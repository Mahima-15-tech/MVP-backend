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
   updateSmsConsent,
   saveEmail,
   saveName,
   saveToken
   
} = require("../controllers/user.controller");
const upload = require("../middleware/uploadProfile");
const { updateProfileImage } = require("../controllers/user.controller");


// 🔹 Profile
router.get("/profile", auth, getProfile);
// const upload = require("../middleware/uploadProfile");

router.put(
  "/profile",
  auth,
  upload.single("image"),
  updateProfile
);
// router.post(
//   "/profile-image",
//   auth,
//   upload.single("image"),
//   updateProfileImage
// );

// 🔹 Preferences
router.put("/preferences", auth, updatePreferences);
router.post("/email", auth, saveEmail);
router.post("/save-name", auth, saveName);
// 🔹 Location
router.post("/location", auth, updateLocation);
router.post("/device-token", auth, saveDeviceToken);
router.post("/sms-consent", auth, updateSmsConsent);
router.post("/signout", auth, logoutUser);
router.post("/save-token",auth, saveToken);
router.delete("/", auth, deleteAccount);


module.exports = router;
