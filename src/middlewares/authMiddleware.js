const jwt = require("jsonwebtoken");
const env = require("../config/env");
const ApiError = require("../utils/apiError");
const Admin = require("../models/Admin");

/**
 * Protect routes - verifies JWT in Authorization Bearer header
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(ApiError.unauthorized("Not authorized to access this route"));
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select("-password");

    if (!admin || !admin.isActive) {
      return next(ApiError.unauthorized("Admin account not found or deactivated"));
    }

    req.user = admin;
    next();
  } catch (err) {
    return next(ApiError.unauthorized("Not authorized to access this route"));
  }
};

/**
 * Role-Based Access Control (RBAC)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(`User role ${req.user?.role} is not authorized to access this route`)
      );
    }
    next();
  };
};

module.exports = { protect, authorize };
