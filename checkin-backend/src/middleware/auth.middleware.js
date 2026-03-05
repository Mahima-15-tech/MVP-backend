const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    // 🔐 Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔎 Check if user still exists
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    // 🚫 Ban Check
    if (user.isBanned) {
      return res.status(403).json({
        message: "Your account has been suspended. Please contact support."
      });
    }

    // Attach clean user object
    req.user = {
      userId: user._id
    };

    next();

  } catch (err) {

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Session expired. Please login again." });
    }

    return res.status(403).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;