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

// Public student booking lookup by Phone, Email, or Booking ID
router.route("/my-bookings")
  .get(getMyBookings)
  .post(getMyBookings);

router.route("/:bookingId")
  .get(getRegistrationByBookingId);

router.route("/:bookingId/status")
  .patch(protect, updatePaymentStatus);

router.route("/:bookingId/reschedule")
  .patch(protect, rescheduleRegistrationSlot);

module.exports = router;
