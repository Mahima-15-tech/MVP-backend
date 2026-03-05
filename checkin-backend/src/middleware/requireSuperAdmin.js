// middleware/requireSuperAdmin.js

module.exports = (req, res, next) => {
    if (req.admin.role !== "SUPER_ADMIN") {
      return res.status(403).json({
        message: "Access denied. Super Admin only."
      });
    }
  
    next();
  };