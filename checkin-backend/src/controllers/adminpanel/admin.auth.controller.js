const Admin = require("../../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        adminId: admin._id,
        role: admin.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      admin: {
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// controllers/adminpanel/admin.auth.controller.js

exports.createAdmin = async (req, res) => {
  try {
    const existingAdmin = await Admin.findOne({ role: "ADMIN" });

    if (existingAdmin) {
      return res.status(400).json({
        message: "Only one ADMIN is allowed"
      });
    }

    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      role: "ADMIN"
    });

    res.json({
      message: "Admin created successfully",
      admin: {
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


