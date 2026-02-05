const cron = require("node-cron");
const Checkin = require("../models/CheckinSchedule");
const Alert = require("../models/Alert");
const User = require("../models/User");
const EmergencyContact = require("../models/EmergencyContact")

console.log("🟢 Check-in cron file loaded");

const isMissedCheckin = (checkin) => {
    const now = new Date();
  
    // checkInTime example: "09:00"
    const [hh, mm] = checkin.checkInTime.split(":");
  
    const scheduled = new Date();
    scheduled.setHours(hh, mm, 0, 0);
  
    const graceEnd = new Date(
      scheduled.getTime() + checkin.graceMinutes * 60000
    );
  
    
    if (!checkin.lastCheckInAt && now > graceEnd) {
      return true;
    }
  
    return false;
  };
  

  cron.schedule("* * * * *", async () => {
    console.log("⏰ Running check-in cron");
  
    const checkins = await Checkin.find({ status: "ACTIVE" })
      .populate("userId");
  
      for (const checkin of checkins) {

        // 🔴 MAIN FIX — yahi missing tha
        if (!checkin.userId) {
          console.warn(
            "⚠️ Orphan check-in found (user deleted). Removing check-in:",
            checkin._id
          );
      
          // optional but recommended cleanup
          await Checkin.findByIdAndDelete(checkin._id);
          continue;
        }
      
        if (isMissedCheckin(checkin)) {
          console.log(
            "🚨 Missed check-in detected. Creating alert for user:",
            checkin.userId._id
          );
      
          // 1️⃣ Create alert
          await Alert.create({
            userId: checkin.userId._id,
            type: "MISSED_CHECKIN",
            language: checkin.userId.language,
            alertVoice: checkin.userId.alertVoice,
            location: checkin.userId.lastKnownLocation || null,
          });
      
          // 2️⃣ Auto pause
          checkin.status = "PAUSED";
          await checkin.save();
      
          console.log(
            "⏸ Check-in auto paused for user:",
            checkin.userId._id
          );
      
          // 3️⃣ Fetch emergency contacts
          const contacts = await EmergencyContact.find({
            userId: checkin.userId._id,
          });
      
          // 4️⃣ Prepare alert payload
          const alertPayload = {
            type: "MISSED_CHECKIN",
            user: {
              id: checkin.userId._id,
              phone: checkin.userId.phone,
            },
            location: checkin.userId.lastKnownLocation || null,
            contacts,
          };
      
          console.log("📦 Alert payload ready:", alertPayload);
        }
      }
      
  });
  
  