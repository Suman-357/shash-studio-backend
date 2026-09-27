const express = require("express");
const router = express.Router();
const { login, getMe, register } = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");

router.post("/login", login);
router.post("/register", register);
router.get("/me", protect, getMe);

module.exports = router;
