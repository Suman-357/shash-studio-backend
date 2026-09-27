const Registration = require("../models/Registration");
const Workshop = require("../models/Workshop");
const ApiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");

/**
 * @desc    Create new registration / booking
 * @route   POST /api/v1/registrations
 * @access  Public
 */
const createRegistration = async (req, res, next) => {
  try {
    const {
      fullName,
      whatsapp,
      email,
      workshopId,
      workshopTitle,
      slot,
      amount,
      languagePref,
      healthNotes,
      paymentMethod,
      upiReference,
      consentGiven
    } = req.body;

    if (!consentGiven) {
      return next(ApiError.badRequest("You must agree to the terms and consent to communications to proceed."));
    }

    const clientIp =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      req.ip ||
      "";

    // Check if workshop exists (optional if local id)
    let finalAmount = amount;
    if (!finalAmount) {
      const workshop = await Workshop.findOne({
        $or: [{ _id: workshopId.match(/^[0-9a-fA-F]{24}$/) ? workshopId : null }, { slug: workshopId }]
      });
      if (workshop) {
        finalAmount = workshop.price;
      } else {
        finalAmount = 499; // Default fallback price
      }
    }

    const registration = await Registration.create({
      fullName,
      whatsapp,
      email,
      workshopId,
      workshopTitle: workshopTitle || "SHASH Studios Batch",
      slot,
      originalSlotSnapshot: {
        slotTime: slot,
        batchTitle: workshopTitle || "SHASH Studios Batch",
        bookedAt: new Date()
      },
      amount: finalAmount,
      languagePref: languagePref || "both",
      healthNotes: healthNotes || "beginner",
      paymentMethod: paymentMethod || "upi",
      upiReference: upiReference || "",
      paymentStatus: "completed", // Direct enrollment
      consentGiven: true,
      consentTimestamp: new Date(),
      consentIp: clientIp
    });

    return ApiResponse.created(
      res,
      {
        bookingId: registration.bookingId,
        fullName: registration.fullName,
        workshopTitle: registration.workshopTitle,
        slot: registration.slot,
        amount: registration.amount,
        whatsapp: registration.whatsapp,
        email: registration.email,
        paymentStatus: registration.paymentStatus,
        consentGiven: registration.consentGiven,
        consentTimestamp: registration.consentTimestamp,
        createdAt: registration.createdAt,
        updatedAt: registration.updatedAt
      },
      "Registration completed successfully! Zoom invite queued."
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all registrations (Admin only)
 * @route   GET /api/v1/registrations
 * @access  Private (Admin)
 */
const getRegistrations = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, workshopId, search } = req.query;
    const query = {};

    if (workshopId) {
      query.workshopId = workshopId;
    }

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { whatsapp: { $regex: search, $options: "i" } },
        { bookingId: { $regex: search, $options: "i" } }
      ];
    }

    const total = await Registration.countDocuments(query);
    const registrations = await Registration.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return ApiResponse.success(
      res,
      {
        registrations,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / limit)
        }
      },
      "Registrations retrieved"
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Lookup student bookings by WhatsApp phone, Email, or Booking ID
 * @route   GET /api/v1/registrations/my-bookings
 * @route   POST /api/v1/registrations/my-bookings
 * @access  Public
 */
const getMyBookings = async (req, res, next) => {
  try {
    const identifier = (
      req.query.identifier ||
      req.query.phone ||
      req.query.email ||
      req.query.bookingId ||
      req.body.identifier ||
      req.body.phone ||
      req.body.email ||
      req.body.bookingId ||
      ""
    ).trim();

    if (!identifier) {
      return next(
        ApiError.badRequest(
          "Please provide your WhatsApp number, Email, or Booking ID to lookup your bookings."
        )
      );
    }

    // Sanitize digits if phone entered (e.g. "+91 98765-43210" -> "9876543210")
    const cleanedDigits = identifier.replace(/\D/g, "");
    const normalizedPhone = cleanedDigits.length > 10 ? cleanedDigits.slice(-10) : cleanedDigits;

    const queryConditions = [];

    // Match by Booking ID (e.g. SHASH-849201)
    if (/^SHASH-/i.test(identifier) || identifier.length >= 8) {
      queryConditions.push({ bookingId: identifier.toUpperCase() });
    }

    // Match by Email
    if (identifier.includes("@")) {
      queryConditions.push({ email: identifier.toLowerCase() });
    }

    // Match by WhatsApp phone (last 10 digits)
    if (normalizedPhone.length >= 10) {
      queryConditions.push({ whatsapp: { $regex: normalizedPhone + "$" } });
    }

    // Default fallback
    if (queryConditions.length === 0) {
      queryConditions.push(
        { bookingId: identifier.toUpperCase() },
        { email: identifier.toLowerCase() }
      );
    }

    const bookings = await Registration.find({ $or: queryConditions })
      .populate("batchId", "batchCode title titleKn slotTime startDate endDate instructorName status zoomLink")
      .sort({ createdAt: -1 });

    if (!bookings || bookings.length === 0) {
      return next(
        ApiError.notFound(
          `No bookings found matching "${identifier}". Please check your 10-digit WhatsApp number or Booking ID.`
        )
      );
    }

    // Format safe response for student portal
    const sanitizedBookings = bookings.map((b) => {
      const isPaid = b.paymentStatus === "completed";
      return {
        bookingId: b.bookingId,
        fullName: b.fullName,
        workshopTitle: b.workshopTitle,
        slot: b.slot,
        originalSlotSnapshot: b.originalSlotSnapshot,
        rescheduleHistory: b.rescheduleHistory,
        amount: b.amount,
        currency: b.currency,
        paymentStatus: b.paymentStatus,
        paymentMethod: b.paymentMethod,
        languagePref: b.languagePref,
        healthNotes: b.healthNotes,
        zoomLink: isPaid
          ? (b.batchId?.zoomLink || "https://zoom.us/j/shash-live-batch")
          : "Available upon payment confirmation",
        batch: b.batchId || null,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt
      };
    });

    return ApiResponse.success(
      res,
      {
        total: sanitizedBookings.length,
        bookings: sanitizedBookings
      },
      `Retrieved ${sanitizedBookings.length} booking record(s).`
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get registration by booking ID
 * @route   GET /api/v1/registrations/:bookingId
 * @access  Public
 */
const getRegistrationByBookingId = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const registration = await Registration.findOne({
      bookingId: bookingId.toUpperCase()
    });

    if (!registration) {
      return next(ApiError.notFound(`No registration found with ID ${bookingId}`));
    }

    return ApiResponse.success(res, registration, "Booking details retrieved");
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update payment status (Admin or Webhook)
 * @route   PATCH /api/v1/registrations/:bookingId/status
 * @access  Private (Admin)
 */
const updatePaymentStatus = async (req, res, next) => {
  try {
    const { status, upiReference } = req.body;
    const registration = await Registration.findOneAndUpdate(
      { bookingId: req.params.bookingId.toUpperCase() },
      { paymentStatus: status, ...(upiReference && { upiReference }) },
      { new: true }
    );

    if (!registration) {
      return next(ApiError.notFound(`Registration ${req.params.bookingId} not found`));
    }

    return ApiResponse.success(res, registration, "Payment status updated");
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reschedule a student's batch slot with full audit tracking
 * @route   PATCH /api/v1/registrations/:bookingId/reschedule
 * @access  Private (Admin or Student verified)
 */
const rescheduleRegistrationSlot = async (req, res, next) => {
  try {
    const { newSlotTime, newBatchId, reason, changedBy = "admin" } = req.body;

    if (!newSlotTime) {
      return next(ApiError.badRequest("New slot timing is required"));
    }

    const registration = await Registration.findOne({
      bookingId: req.params.bookingId.toUpperCase()
    });

    if (!registration) {
      return next(ApiError.notFound(`Registration ${req.params.bookingId} not found`));
    }

    const oldSlot = registration.slot;

    // Log the change into rescheduleHistory array
    registration.rescheduleHistory.push({
      fromSlotTime: oldSlot,
      toSlotTime: newSlotTime,
      fromBatchId: registration.batchId,
      toBatchId: newBatchId || null,
      changedAt: new Date(),
      changedBy,
      reason: reason || "Schedule adjustment",
      studentNotified: true
    });

    // Update active slot
    registration.slot = newSlotTime;
    if (newBatchId) registration.batchId = newBatchId;

    await registration.save(); // Automatically updates updatedAt

    return ApiResponse.success(
      res,
      {
        bookingId: registration.bookingId,
        previousSlot: oldSlot,
        activeSlot: registration.slot,
        originalBookingSlot: registration.originalSlotSnapshot?.slotTime,
        rescheduleHistory: registration.rescheduleHistory,
        updatedAt: registration.updatedAt
      },
      `Batch slot successfully rescheduled from "${oldSlot}" to "${newSlotTime}". Audit log updated.`
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRegistration,
  getRegistrations,
  getRegistrationByBookingId,
  getMyBookings,
  updatePaymentStatus,
  rescheduleRegistrationSlot
};
