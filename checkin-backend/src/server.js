const path = require("path");

// 🔥 FORCE dotenv to load from root
require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

require("./cron/checkin.cron");
console.log("DEBUG MONGO_URI =", process.env.MONGO_URI);

const app = require("./app");
const connectDB = require("./config/db");




const PORT = process.env.PORT || 3000;

connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
