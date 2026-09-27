const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");

const env = require("./config/env");
const routes = require("./routes");
const errorHandler = require("./middlewares/errorHandler");
const { apiLimiter } = require("./middlewares/rateLimiter");
const ApiError = require("./utils/apiError");

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin || env.ALLOWED_ORIGINS.includes(origin) || env.NODE_ENV === "development") {
        return callback(null, true);
      }
      return callback(new Error("CORS policy violation: Origin not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// Gzip compression
app.use(compression());

// Body parsers with safe payload limits
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));

// HTTP request logger
if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Rate limiting on API routes
app.use("/api", apiLimiter);

// API v1 Routes
app.use("/api/v1", routes);

// 404 Handler for undefined routes
app.use((req, res, next) => {
  next(ApiError.notFound(`Cannot find ${req.method} ${req.originalUrl} on this server`));
});

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
