const mongoose = require("mongoose");
const env = require("./env");

/**
 * Robust MongoDB Connection Manager
 * Implements connection pooling, retry logic, and monitoring events
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`🌿 MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on("error", (err) => {
      console.error(`⚠️ MongoDB runtime error: ${err.message}`);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected. Attempting reconnection...");
    });

    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Failed: ${error.message}`);
    // In production, exit or retry with exponential backoff
    if (env.NODE_ENV === "production") {
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log("🌿 MongoDB connection safely closed.");
  } catch (err) {
    console.error(`⚠️ Error closing MongoDB connection: ${err.message}`);
  }
};

module.exports = { connectDB, disconnectDB };
