const Inquiry = require("../models/Inquiry");
const ApiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");

/**
 * @desc    Submit student inquiry / message
 * @route   POST /api/v1/inquiries
 * @access  Public
 */
const createInquiry = async (req, res, next) => {
  try {
    const { name, whatsapp, program, message, consentGiven } = req.body;
    const clientIp =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      req.ip ||
      "";

    const inquiry = await Inquiry.create({
      name,
      whatsapp,
      program: program || "General Query / Scholarship",
      message,
      consentGiven: Boolean(consentGiven ?? true),
      consentTimestamp: new Date(),
      consentIp: clientIp
    });

    return ApiResponse.created(
      res,
      inquiry,
      "✦ ಧನ್ಯವಾದಗಳು! Thank you! Message sent to Mysuru coordinator desk."
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all inquiries (Admin only)
 * @route   GET /api/v1/inquiries
 * @access  Private (Admin)
 */
const getInquiries = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    const total = await Inquiry.countDocuments(query);
    const inquiries = await Inquiry.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return ApiResponse.success(
      res,
      {
        inquiries,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / limit)
        }
      },
      "Inquiries retrieved"
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update inquiry status / notes
 * @route   PATCH /api/v1/inquiries/:id
 * @access  Private (Admin)
 */
const updateInquiryStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { ...(status && { status }), ...(notes !== undefined && { notes }) },
      { new: true }
    );

    if (!inquiry) {
      return next(ApiError.notFound("Inquiry not found"));
    }

    return ApiResponse.success(res, inquiry, "Inquiry updated");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInquiry,
  getInquiries,
  updateInquiryStatus
};
