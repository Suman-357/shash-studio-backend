const express = require("express");
const router = express.Router();
const {
  createRegistration,
  getRegistrations,
  getRegistrationByBookingId,
  getMyBookings,
  updatePaymentStatus,
  rescheduleRegistrationSlot
} = require("../controllers/registrationController");
const { protect } = require("../middlewares/authMiddleware");
const { validateRegistration } = require("../middlewares/validationMiddleware");
const { submissionLimiter } = require("../middlewares/rateLimiter");

router.route("/")
  .post(submissionLimiter, validateRegistration, createRegistration)
  .get(protect, getRegistrations);

// Public student booking lookup by Phone, Email, or Booking ID (rate-limited)
router.route("/my-bookings")
  .get(submissionLimiter, getMyBookings)
  .post(submissionLimiter, getMyBookings);

// Admin-only direct registration lookup by booking ID
router.route("/:bookingId")
  .get(protect, getRegistrationByBookingId);

router.route("/:bookingId/status")
  .patch(protect, updatePaymentStatus);

router.route("/:bookingId/reschedule")
  .patch(protect, rescheduleRegistrationSlot);

module.exports = router;
