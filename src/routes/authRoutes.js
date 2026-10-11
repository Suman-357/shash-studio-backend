const express = require("express");
const router = express.Router();
const { login, getMe, register } = require("../controllers/authController");
const { protect, authorize } = require("../middlewares/authMiddleware");

router.post("/login", login);
router.post("/register", protect, authorize("superadmin"), register);
router.get("/me", protect, getMe);

module.exports = router;
