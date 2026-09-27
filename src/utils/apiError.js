/**
 * Operational Custom API Error Class
 */
class ApiError extends Error {
  constructor(message = "Internal Server Error", statusCode = 500, errors = [], stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.success = false;
    this.errors = errors;
    this.isOperational = true;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static badRequest(message = "Bad Request", errors = []) {
    return new ApiError(message, 400, errors);
  }

  static unauthorized(message = "Unauthorized access") {
    return new ApiError(message, 401);
  }

  static forbidden(message = "Forbidden access") {
    return new ApiError(message, 403);
  }

  static notFound(message = "Resource not found") {
    return new ApiError(message, 404);
  }

  static conflict(message = "Resource conflict") {
    return new ApiError(message, 409);
  }

  static internal(message = "Internal server error") {
    return new ApiError(message, 500);
  }
}

module.exports = ApiError;
