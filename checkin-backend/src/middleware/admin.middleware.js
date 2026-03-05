// middleware/admin.middleware.js

const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Admin.findById(decoded.adminId);

    if (!admin || !admin.isActive) {
      return res.status(401).json({ message: "Admin not active" });
    }

    req.admin = decoded; // full admin object
    next();

  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};