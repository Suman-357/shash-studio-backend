const rateLimit = require("express-rate-limit");
const env = require("../config/env");

/**
 * Standard API Rate Limiter
 */
const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: "Too many requests from this IP, please try again after 15 minutes."
  }
});

/**
 * Stricter Limiter for Registration & Contact submissions (prevents bot spam)
 */
const submissionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 submissions per hour per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: "Too many booking attempts from this IP. Please contact us on WhatsApp for assistance."
  }
});

module.exports = { apiLimiter, submissionLimiter };
