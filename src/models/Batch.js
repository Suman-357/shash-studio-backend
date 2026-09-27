const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema(
  {
    workshopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workshop",
      required: [true, "Workshop reference is required"],
      index: true
    },
    batchCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true // e.g. "SHASH-2026-AUG-MORN1"
    },
    title: {
      type: String,
      required: [true, "Batch title is required"],
      trim: true // e.g. "August Morning Rising Batch"
    },
    titleKn: {
      type: String,
      trim: true // e.g. "ಆಗಸ್ಟ್ ಮುಂಜಾನೆ ಬ್ಯಾಚ್"
    },
    section: {
      type: String,
      default: "yoga",
      lowercase: true,
      trim: true,
      index: true
    },
    slotTime: {
      type: String,
      required: [true, "Slot timing is required"],
      trim: true // e.g. "5:30 AM – 6:30 AM IST"
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    capacity: {
      type: Number,
      required: true,
      default: 20,
      min: 1
    },
    enrolledCount: {
      type: Number,
      default: 0,
      min: 0
    },
    zoomLink: {
      type: String,
      trim: true,
      default: ""
    },
    instructorName: {
      type: String,
      default: "Sushii & Team",
      trim: true
    },
    status: {
      type: String,
      enum: ["upcoming", "active", "completed", "rescheduled", "cancelled"],
      default: "upcoming",
      index: true
    },
    // Reschedule audit fields if batch timing was migrated
    rescheduledToBatchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      default: null
    },
    rescheduleReason: {
      type: String,
      default: ""
    },
    rescheduledAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Virtual for available spots
batchSchema.virtual("spotsAvailable").get(function () {
  return Math.max(0, this.capacity - this.enrolledCount);
});

const Batch = mongoose.model("Batch", batchSchema);

module.exports = Batch;
