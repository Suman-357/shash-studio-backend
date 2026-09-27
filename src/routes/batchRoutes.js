const express = require("express");
const router = express.Router();
const {
  getBatches,
  getBatchById,
  createBatch,
  updateBatch,
  rescheduleBatch,
  getBatchStats,
  deleteBatch
} = require("../controllers/batchController");
const { protect } = require("../middlewares/authMiddleware");

// Overview stats (must be placed before :id)
router.route("/overview/stats")
  .get(protect, getBatchStats);

router.route("/")
  .get(getBatches)
  .post(protect, createBatch);

router.route("/:id")
  .get(protect, getBatchById)
  .put(protect, updateBatch)
  .delete(protect, deleteBatch);

router.route("/:id/reschedule")
  .post(protect, rescheduleBatch);

module.exports = router;
