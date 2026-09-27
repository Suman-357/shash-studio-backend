const ApiError = require("../utils/apiError");
const env = require("../config/env");

/**
 * Centralized Production-Grade Error Handler
 * Formats errors consistently, masks stack traces in production,
 * and handles Mongoose CastError, ValidationError, and duplicate keys.
 */
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === "CastError") {
    const message = `Resource not found with id of ${err.value}`;
    error = ApiError.notFound(message);
  }

  // Handle Mongoose Duplicate Key (11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate value entered for ${field}. Please use another value.`;
    error = ApiError.conflict(message);
  }

  // Handle Mongoose Validation Error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => val.message);
    error = ApiError.badRequest("Validation failed", messages);
  }

  // Handle JWT Errors
  if (err.name === "JsonWebTokenError") {
    error = ApiError.unauthorized("Invalid authentication token");
  }

  if (err.name === "TokenExpiredError") {
    error = ApiError.unauthorized("Authentication token has expired");
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: error.errors || [],
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
    timestamp: new Date().toISOString()
  });
};

module.exports = errorHandler;
