const Admin = require("../../models/Admin");
const bcrypt = require("bcryptjs");

/* ===============================
   GET CURRENT ADMIN PROFILE
================================= */

exports.getMyProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.adminId).select("-password");

    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
   CHANGE PASSWORD
================================= */

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const admin = await Admin.findById(req.admin.adminId);

    const isMatch = await bcrypt.compare(currentPassword, admin.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Current password incorrect" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    admin.password = hashed;

    await admin.save();

    res.json({ message: "Password updated successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
   GET ALL ADMINS (Super Only)
================================= */

exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select("-password");
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
   DELETE ADMIN (Super Only)
================================= */

exports.deleteAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;

    if (adminId === req.admin.adminId) {
      return res.status(400).json({ message: "Cannot delete yourself" });
    }

    await Admin.findByIdAndDelete(adminId);

    res.json({ message: "Admin deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};