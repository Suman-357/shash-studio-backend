const app = require("./src/app");
const env = require("./src/config/env");
const { connectDB, disconnectDB } = require("./src/config/db");

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("💥 UNCAUGHT EXCEPTION! Shutting down gracefully...", err);
  process.exit(1);
});

let server;

// Start server after database connection
const startServer = async () => {
  await connectDB();

  server = app.listen(env.PORT, () => {
    console.log(
      `🪷 SHASH Studios Backend API running in [${env.NODE_ENV}] mode on port http://localhost:${env.PORT}`
    );
    console.log(`📡 Health Check: http://localhost:${env.PORT}/api/v1/health`);
  });
};

startServer();

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("💥 UNHANDLED REJECTION! Shutting down gracefully...", err);
  if (server) {
    server.close(async () => {
      await disconnectDB();
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Graceful termination handler (Docker, Heroku, PM2, Ctrl+C)
const gracefulShutdown = (signal) => {
  console.log(`\n🛑 Received ${signal}. Closing server gracefully...`);
  if (server) {
    server.close(async () => {
      console.log("💥 HTTP Server closed.");
      await disconnectDB();
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
