const express = require("express");
const router = express.Router();
const { login, getMe, register } = require("../controllers/authController");
const { protect, authorize } = require("../middlewares/authMiddleware");
const { submissionLimiter } = require("../middlewares/rateLimiter");

router.post("/login", submissionLimiter, login);
router.post("/register", protect, authorize("superadmin"), register);
router.get("/me", protect, getMe);

module.exports = router;
