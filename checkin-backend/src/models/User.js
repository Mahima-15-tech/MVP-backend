const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {

    phone: { type: String, required: true, unique: true },
  isVerified: { type: Boolean, default: false },
  name: {
    type: String,
  },
nameCompleted: {
    type: Boolean,
    default: false
  },
  age: Number,
gender: {
  type: String,
  enum: ["Male", "Female", "Other"],
},
email: String,
emailCompleted: {
  type: Boolean,
  default: false
},
profileImage: {
  type: String,
  default: null
},
profileLocation: String,
language: {
  type: String,
  enum: ["en", "zh"],
  default: "en"
},
alertVoice: {
  type: String,
  enum: ["female_soft","male_soft"],
  default: "female_soft"
 },
  lastKnownLocation: {
    lat: Number,
    lng: Number,
    updatedAt: Date,
  },

  country:{
    type:String
   },
   stripeCustomerId: String,
   
   region:{
    type:String,
    enum:["APAC","EMEA","LATAM","OTHER"],
    default:"OTHER"
   },

  // subscription related
  subscriptionStatus: {
    type: String,
    enum: ["ACTIVE", "TRIAL", "EXPIRED", "CANCELLED", "NONE"],
    default: "NONE",
  },
  
  isBanned: {
    type: Boolean,
    default: false
  },
  banReason: String,
  bannedAt: Date,

  fcmToken: {
    type: String,
    default: null
  },

  deviceToken: {
    type: String,
  },

  timezone: {
    type: String,
    default: "UTC"
  }



 },

 
  
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
