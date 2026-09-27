const Batch = require("../models/Batch");
const Registration = require("../models/Registration");
const Workshop = require("../models/Workshop");
const ApiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");

/**
 * @desc    Get all batches with workshop details and occupancy
 * @route   GET /api/v1/batches
 * @access  Public (or Protected Admin)
 */
const getBatches = async (req, res, next) => {
  try {
    const { workshopId, status, search } = req.query;
    const query = {};

    if (workshopId) query.workshopId = workshopId;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { batchCode: { $regex: search, $options: "i" } },
        { slotTime: { $regex: search, $options: "i" } }
      ];
    }

    const batches = await Batch.find(query)
      .populate("workshopId", "title titleKn slug price category")
      .sort({ startDate: 1, slotTime: 1 });

    // Calculate real-time counts from registrations
    const enhancedBatches = await Promise.all(
      batches.map(async (batch) => {
        const actualCount = await Registration.countDocuments({
          $or: [
            { batchId: batch._id },
            { slot: batch.slotTime }
          ]
        });
        const batchObj = batch.toObject();
        batchObj.enrolledCount = actualCount;
        batchObj.spotsAvailable = Math.max(0, batch.capacity - actualCount);
        batchObj.occupancyPercent = Math.round((actualCount / (batch.capacity || 20)) * 100);
        return batchObj;
      })
    );

    return ApiResponse.success(res, enhancedBatches, "Batches retrieved successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single batch with all enrolled students
 * @route   GET /api/v1/batches/:id
 * @access  Private (Admin)
 */
const getBatchById = async (req, res, next) => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate("workshopId", "title titleKn slug price image category");

    if (!batch) {
      return next(ApiError.notFound("Batch not found"));
    }

    // Get all students enrolled in this batch or slot
    const students = await Registration.find({
      $or: [
        { batchId: batch._id },
        { slot: batch.slotTime }
      ]
    }).sort({ createdAt: -1 });

    const batchData = batch.toObject();
    batchData.students = students;
    batchData.enrolledCount = students.length;
    batchData.spotsAvailable = Math.max(0, batch.capacity - students.length);

    return ApiResponse.success(res, batchData, "Batch details and student roster retrieved");
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new batch slot
 * @route   POST /api/v1/batches
 * @access  Private (Admin)
 */
const createBatch = async (req, res, next) => {
  try {
    const {
      workshopId,
      batchCode,
      title,
      titleKn,
      section = "yoga",
      slotTime,
      startDate,
      endDate,
      capacity = 20,
      zoomLink = "",
      instructorName = "Sushii & Team"
    } = req.body;

    if (!workshopId || !title || !slotTime) {
      return next(ApiError.badRequest("Workshop, title, and slot timing are required"));
    }

    const genCode = batchCode || `BATCH-${Date.now().toString().slice(-6)}`;

    const batch = await Batch.create({
      workshopId,
      batchCode: genCode.toUpperCase(),
      title,
      titleKn: titleKn || title,
      section: section || "yoga",
      slotTime,
      startDate: startDate || new Date(),
      endDate: endDate || new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // Default 21 days
      capacity: Number(capacity),
      zoomLink,
      instructorName
    });

    return ApiResponse.created(res, batch, "New batch created successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update batch / slot timing details
 * @route   PUT /api/v1/batches/:id
 * @access  Private (Admin)
 */
const updateBatch = async (req, res, next) => {
  try {
    const { title, titleKn, section, slotTime, capacity, status, zoomLink, instructorName, startDate, endDate } = req.body;

    const batch = await Batch.findById(req.params.id);
    if (!batch) {
      return next(ApiError.notFound("Batch not found"));
    }

    const previousSlotTime = batch.slotTime;

    if (title) batch.title = title;
    if (titleKn) batch.titleKn = titleKn;
    if (section) batch.section = section;
    if (slotTime) batch.slotTime = slotTime;
    if (capacity !== undefined) batch.capacity = Number(capacity);
    if (status) batch.status = status;
    if (zoomLink !== undefined) batch.zoomLink = zoomLink;
    if (instructorName) batch.instructorName = instructorName;
    if (startDate) batch.startDate = startDate;
    if (endDate) batch.endDate = endDate;

    await batch.save();

    // If slotTime changed, optionally sync or note in registrations
    if (slotTime && slotTime !== previousSlotTime) {
      batch.rescheduleReason = `Slot time modified from ${previousSlotTime} to ${slotTime}`;
      batch.rescheduledAt = new Date();
      await batch.save();
    }

    return ApiResponse.success(res, batch, "Batch updated successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reschedule batch & migrate all enrolled students with full audit log
 * @route   POST /api/v1/batches/:id/reschedule
 * @access  Private (Admin)
 */
const rescheduleBatch = async (req, res, next) => {
  try {
    const { newSlotTime, newStartDate, newEndDate, reason } = req.body;

    if (!newSlotTime) {
      return next(ApiError.badRequest("New slot timing is required for rescheduling"));
    }

    const batch = await Batch.findById(req.params.id);
    if (!batch) {
      return next(ApiError.notFound("Batch not found"));
    }

    const oldSlot = batch.slotTime;

    // Find all registrations currently linked to this batch or slot
    const registrations = await Registration.find({
      $or: [{ batchId: batch._id }, { slot: oldSlot }]
    });

    // Update each student's registration with audit history
    const updatePromises = registrations.map(async (reg) => {
      reg.rescheduleHistory.push({
        fromSlotTime: oldSlot,
        toSlotTime: newSlotTime,
        fromBatchId: batch._id,
        toBatchId: batch._id,
        changedAt: new Date(),
        changedBy: "admin",
        reason: reason || "Batch schedule adjustment",
        studentNotified: true
      });
      reg.slot = newSlotTime;
      reg.batchId = batch._id;
      return reg.save();
    });

    await Promise.all(updatePromises);

    // Update batch record
    batch.slotTime = newSlotTime;
    if (newStartDate) batch.startDate = newStartDate;
    if (newEndDate) batch.endDate = newEndDate;
    batch.rescheduleReason = reason || "Batch timing rescheduled";
    batch.rescheduledAt = new Date();
    batch.status = "rescheduled";
    await batch.save();

    return ApiResponse.success(
      res,
      {
        batch,
        migratedStudentsCount: registrations.length,
        previousSlot: oldSlot,
        newSlot: newSlotTime
      },
      `Successfully rescheduled batch from "${oldSlot}" to "${newSlotTime}". Migrated ${registrations.length} student records.`
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get aggregated overview of slots, capacity, and revenue
 * @route   GET /api/v1/batches/overview/stats
 * @access  Private (Admin)
 */
const getBatchStats = async (req, res, next) => {
  try {
    const totalBatches = await Batch.countDocuments();
    const activeBatches = await Batch.countDocuments({ status: { $in: ["upcoming", "active"] } });
    const totalRegistrations = await Registration.countDocuments();
    const paidRegistrations = await Registration.countDocuments({ paymentStatus: "completed" });

    // Aggregate revenue
    const revenueAgg = await Registration.aggregate([
      { $match: { paymentStatus: "completed" } },
      { $group: { _id: null, totalRevenue: { $sum: "$amount" } } }
    ]);
    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

    // Slot distribution breakdown
    const slotDistribution = await Registration.aggregate([
      {
        $group: {
          _id: "$slot",
          count: { $sum: 1 },
          revenue: { $sum: "$amount" }
        }
      },
      { $sort: { count: -1 } }
    ]);

    return ApiResponse.success(
      res,
      {
        totalBatches,
        activeBatches,
        totalRegistrations,
        paidRegistrations,
        totalRevenue,
        slotDistribution
      },
      "Studio analytics and slot stats retrieved"
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete batch
 * @route   DELETE /api/v1/batches/:id
 * @access  Private (Admin)
 */
const deleteBatch = async (req, res, next) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) {
      return next(ApiError.notFound("Batch not found"));
    }

    // Check if students are registered
    const studentCount = await Registration.countDocuments({
      $or: [{ batchId: batch._id }, { slot: batch.slotTime }]
    });

    if (studentCount > 0) {
      // Soft cancel instead of hard delete
      batch.status = "cancelled";
      await batch.save();
      return ApiResponse.success(
        res,
        batch,
        `Batch marked as cancelled because ${studentCount} students are enrolled.`
      );
    }

    await Batch.findByIdAndDelete(req.params.id);
    return ApiResponse.success(res, null, "Batch deleted successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBatches,
  getBatchById,
  createBatch,
  updateBatch,
  rescheduleBatch,
  getBatchStats,
  deleteBatch
};
