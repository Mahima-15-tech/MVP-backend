const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const checkinRoutes = require("./routes/checkin.routes");
const userRoutes = require("./routes/user.routes");
const contactRoutes = require("./routes/contact.routes");
const alertRoutes = require("./routes/alert.routes");
const adminRoutes = require("./routes/admin.routes");


const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/checkin", checkinRoutes);
app.use("/api/user", userRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/admin/auth", adminRoutes);
app.use("/api/admin", adminRoutes);


app.get("/", (req, res) => {
  res.send("Backend is running");
});

module.exports = app;
