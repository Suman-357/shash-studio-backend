const express = require("express");
const router = express.Router();
const {
  getWorkshops,
  getWorkshopById,
  createWorkshop,
  updateWorkshop,
  deleteWorkshop,
} = require("../controllers/workshopController");
const { protect, authorize } = require("../middlewares/authMiddleware");

router.route("/")
  .get(getWorkshops)
  .post(protect, authorize("superadmin", "coordinator"), createWorkshop);

router.route("/:idOrSlug")
  .get(getWorkshopById)
  .put(protect, authorize("superadmin", "coordinator"), updateWorkshop)
  .delete(protect, authorize("superadmin"), deleteWorkshop);

module.exports = router;
