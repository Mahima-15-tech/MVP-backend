const bcrypt = require("bcryptjs");
const { sendSMS } = require("../../services/smsService");
const Admin = require("../../models/Admin");
const AdminResetLog = require("../../models/AdminResetLog");


exports.resetPassword = async (req, res) => {
    try {
  
      const { phone, otp, newPassword } = req.body;
  
      const admin = await Admin.findOne({ phone });
  
      if (!admin) {
        return res.status(400).json({ message: "Invalid OTP" });
      }
  
      if (!admin.resetOtp || admin.resetOtpExpires < Date.now()) {
        return res.status(400).json({
          message: "OTP expired"
        });
      }

      await AdminResetLog.create({
        adminId: admin._id,
        email,
        ipAddress: req.ip,
        status: "SUCCESS"
      });
  
      const isMatch = await bcrypt.compare(otp, admin.resetOtp);
  
      if (!isMatch) {
  
        admin.resetOtpAttempts += 1;
  
        if (admin.resetOtpAttempts >= 3) {
          admin.resetOtpBlockedUntil = Date.now() + 10 * 60 * 1000;
          admin.resetOtpAttempts = 0;
        }
  
        await admin.save();
  
        return res.status(400).json({
          message: "Invalid OTP"
        });
      }
  
      // Success
      admin.password = await bcrypt.hash(newPassword, 10);
      admin.resetOtp = undefined;
      admin.resetOtpExpires = undefined;
      admin.resetOtpAttempts = 0;
      admin.resetOtpBlockedUntil = undefined;
  
      await admin.save();

      
  
      res.json({ message: "Password reset successful" });
  
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };