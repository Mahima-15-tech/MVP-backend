require("dotenv").config(); // VERY IMPORTANT

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("../checkin-backend/src/models/Admin"); // FIXED PATH

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Mongo Connected"))
  .catch(err => console.log(err));

async function createSuperAdmin() {
  try {
    const existing = await Admin.findOne({ role: "SUPER_ADMIN" });

    if (existing) {
      console.log("Super Admin already exists");
      process.exit();
    }

    const hashed = await bcrypt.hash("123456", 10);

    await Admin.create({
      name: "Super Admin",
      email: "super@solo.com",
      password: hashed,
      role: "SUPER_ADMIN"
    });

    console.log("Super Admin Created Successfully");
    process.exit();

  } catch (error) {
    console.log(error);
    process.exit();
  }
}

createSuperAdmin();