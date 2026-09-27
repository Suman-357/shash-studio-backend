const Admin = require("../models/Admin");
const ApiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");

/**
 * @desc    Login Admin / Coordinator
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(ApiError.badRequest("Please provide an email and password"));
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() }).select("+password");

    if (!admin || !(await admin.matchPassword(password))) {
      return next(ApiError.unauthorized("Invalid email or password"));
    }

    if (!admin.isActive) {
      return next(ApiError.unauthorized("Your admin account has been deactivated"));
    }

    const token = admin.getSignedJwtToken();

    return ApiResponse.success(
      res,
      {
        token,
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        }
      },
      "Logged in successfully"
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in admin
 * @route   GET /api/v1/auth/me
 * @access  Private (Admin)
 */
const getMe = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.user.id);
    return ApiResponse.success(res, admin, "Current admin profile");
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Register initial coordinator / admin (Bootstrap)
 * @route   POST /api/v1/auth/register
 * @access  Public (or Superadmin only in production)
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      return next(ApiError.conflict("Admin with this email already exists"));
    }

    const admin = await Admin.create({
      name,
      email,
      password,
      role: role || "coordinator"
    });

    const token = admin.getSignedJwtToken();

    return ApiResponse.created(
      res,
      {
        token,
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        }
      },
      "Admin registered successfully"
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  getMe,
  register
};
