const express = require("express");
const router = express.Router();
const {
  getSpecialEvents,
  getSpecialEventById,
  createSpecialEvent,
  updateSpecialEvent,
  deleteSpecialEvent,
  registerForSpecialEvent
} = require("../controllers/specialEventController");
const { protect } = require("../middlewares/authMiddleware");
const { submissionLimiter } = require("../middlewares/rateLimiter");

router.route("/")
  .get(getSpecialEvents)
  .post(protect, createSpecialEvent);

router.route("/:idOrSlug")
  .get(getSpecialEventById);

router.route("/:id")
  .put(protect, updateSpecialEvent)
  .delete(protect, deleteSpecialEvent);

router.route("/:idOrSlug/register")
  .post(submissionLimiter, registerForSpecialEvent);

module.exports = router;

