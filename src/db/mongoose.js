// Load env variables
require("dotenv").config({ path: "config/dev.env" });

const mongoose = require("mongoose");

const uri = process.env.Mongo_URL;

if (!uri) {
  throw new Error("❌ Mongo_URL environment variable is not defined!");
}

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
}).then(() => {
  console.log("✅ Connected to MongoDB");
}).catch((err) => {
  console.error("❌ MongoDB Connection Error:", err);
});

module.exports = mongoose;
