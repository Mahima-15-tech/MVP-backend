const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {

    phone: { type: String, required: true, unique: true },
  isVerified: { type: Boolean, default: false },
  name: {
    type: String,
  },
  age: Number,
gender: {
  type: String,
  enum: ["Male", "Female", "Other"],
},
email: String,
profileLocation: String,
  language: { type: String, default: "en" },
  alertVoice: { type: String, default: "female_soft" },
  lastKnownLocation: {
    lat: Number,
    lng: Number,
    updatedAt: Date,
  },
  
  },
  
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
