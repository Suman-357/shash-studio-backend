const express = require("express");
const router = express.Router();
const {
  getSections,
  getSectionBySlug,
  createSection,
  updateSection,
  deleteSection
} = require("../controllers/sectionController");
const { protect, authorize } = require("../middlewares/authMiddleware");

router.route("/")
  .get(getSections)
  .post(protect, authorize("superadmin", "coordinator"), createSection);

router.route("/:idOrSlug")
  .get(getSectionBySlug)
  .put(protect, authorize("superadmin", "coordinator"), updateSection)
  .delete(protect, authorize("superadmin"), deleteSection);

module.exports = router;
