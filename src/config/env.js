const dotenv = require("dotenv");
const path = require("path");

// Load .env if present
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT, 10) || 5000,
  MONGODB_URI:
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/shash_studios",
  JWT_SECRET:
    process.env.JWT_SECRET || "shash_studios_super_secure_mysuru_secret_key_2026",
  JWT_EXPIRE: process.env.JWT_EXPIRE || "30d",
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((s) => s.trim())
    : ["http://localhost:5173", "http://localhost:3000"],
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 mins
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100
};

module.exports = env;
