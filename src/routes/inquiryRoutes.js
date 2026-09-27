const express = require("express");
const router = express.Router();
const {
  createInquiry,
  getInquiries,
  updateInquiryStatus,
} = require("../controllers/inquiryController");
const { protect } = require("../middlewares/authMiddleware");
const { validateInquiry } = require("../middlewares/validationMiddleware");
const { submissionLimiter } = require("../middlewares/rateLimiter");

router.route("/")
  .post(submissionLimiter, validateInquiry, createInquiry)
  .get(protect, getInquiries);

router.route("/:id")
  .patch(protect, updateInquiryStatus);

module.exports = router;
