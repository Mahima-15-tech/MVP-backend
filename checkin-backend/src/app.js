const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const checkinRoutes = require("./routes/checkin.routes");
const userRoutes = require("./routes/user.routes");
const contactRoutes = require("./routes/contact.routes");
const alertRoutes = require("./routes/alert.routes");
const adminRoutes = require("./routes/admin/admin.routes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const webhookRoutes = require("./routes/webhook");
const creditRoutes = require("./routes/creditRoutes");
const supportRoutes = require("./routes/support.routes");
const broadcastRoutes = require("./routes/broadcastRoutes.js");
const promoRoutes = require("./routes/promoRoutes");
const stripeRoutes = require("./routes/stripe");

const app = express();

app.use(cors());

app.use("/webhook/stripe", express.raw({ type: "application/json" }));


app.use("/webhook", webhookRoutes);


app.use(express.json());


app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/checkin", checkinRoutes);
app.use("/api/user", userRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/alerts", alertRoutes);
// app.use("/api/admin/auth", adminRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/subscription", subscriptionRoutes);
// app.use("/webhook", webhookRoutes);
app.use("/api/credits", creditRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/promo", promoRoutes);
// app.use("/api", require("./routes/testEmail"));
app.get("/success", (req, res) => {
  res.send("Payment Successful ✅");
});

app.get("/cancel", (req, res) => {
  res.send("Payment Cancelled ❌");
});


app.use("/api/broadcast", broadcastRoutes);

app.use("/api/stripe", stripeRoutes);

app.use(express.urlencoded({ extended: false }));
app.use("/twilio", require("./routes/twilioRoutes"));
app.use("/test", require("./routes/testRoutes"));

app.use("/twilio", require("./routes/twilio.routes"));
app.use("/public", express.static("public"));

app.get("/", (req, res) => {
  res.send("Backend is running");
});

module.exports = app;
