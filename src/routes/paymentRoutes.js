const express = require("express");
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  getPaymentDetails,
  handleWebhook,
} = require("../controllers/paymentController");
const { protect } = require("../middlewares/authMiddleware");
const { submissionLimiter } = require("../middlewares/rateLimiter");

// Public — called from frontend checkout
router.post("/create-order", submissionLimiter, createOrder);
router.post("/verify", submissionLimiter, verifyPayment);

// Razorpay webhook — no auth, verified via HMAC signature
router.post("/webhook", handleWebhook);

// Admin — lookup payment on Razorpay dashboard
router.get("/:paymentId", protect, getPaymentDetails);

module.exports = router;
