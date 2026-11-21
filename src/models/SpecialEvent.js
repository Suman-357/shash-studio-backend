const mongoose = require("mongoose");

const specialEventSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: [true, "Event slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true
    },
    titleKn: {
      type: String,
      trim: true,
      default: ""
    },
    badge: {
      type: String,
      trim: true,
      default: "SPECIAL BATCH · LIMITED SEATS"
    },
    badgeKn: {
      type: String,
      trim: true,
      default: "ವಿಶೇಷ ಬ್ಯಾಚ್ · ಸೀಮಿತ ಸೀಟುಗಳು"
    },
    eventDateLabel: {
      type: String,
      required: [true, "Event date label is required"],
      trim: true // e.g. "30th November"
    },
    startDate: {
      type: Date,
      required: [true, "Event start date is required"]
    },
    endDate: {
      type: Date,
      default: null
    },
    duration: {
      type: String,
      trim: true,
      default: "21 Days · 60 Mins Daily"
    },
    ageLimit: {
      type: String,
      trim: true,
      default: "" // e.g. "14 years & above"
    },
    accessLabel: {
      type: String,
      trim: true,
      default: "Zoom Live"
    },
    altAccessOptions: [
      {
        platform: {
          type: String,
          trim: true,
          lowercase: true,
          default: "other" // "youtube" | "instagram" | "other"
        },
        label: {
          type: String,
          trim: true,
          required: true
        },
        price: {
          type: Number,
          required: true,
          min: 0
        },
        url: {
          type: String,
          trim: true,
          default: ""
        },
        note: {
          type: String,
          trim: true,
          default: ""
        }
      }
    ],
    timingSlot: {
      type: String,
      required: [true, "Primary timing slot is required"],
      trim: true // e.g. "6:00 AM – 7:00 AM IST"
    },
    slots: [
      {
        type: String,
        trim: true
      }
    ],
    price: {
      type: Number,
      required: [true, "Registration amount is required"],
      min: [1, "Registration amount must be at least ₹1"]
    },
    originalPrice: {
      type: Number,
      default: 0,
      min: 0
    },
    capacity: {
      type: Number,
      required: true,
      default: 50,
      min: [1, "Capacity must be at least 1"]
    },
    enrolledCount: {
      type: Number,
      default: 0,
      min: 0
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
      trim: true
    },
    descriptionKn: {
      type: String,
      trim: true,
      default: ""
    },
    highlights: [
      {
        type: String,
        trim: true
      }
    ],
    instructorName: {
      type: String,
      trim: true,
      default: "Sushii"
    },
    image: {
      type: String,
      trim: true,
      default: "challenge-21"
    },
    zoomLink: {
      type: String,
      trim: true,
      default: ""
    },
    status: {
      type: String,
      enum: ["upcoming", "open", "full", "completed", "cancelled"],
      default: "open",
      index: true
    },
    isFeatured: {
      type: Boolean,
      default: true
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

specialEventSchema.virtual("spotsAvailable").get(function () {
  return Math.max(0, (this.capacity || 50) - (this.enrolledCount || 0));
});

const SpecialEvent = mongoose.model("SpecialEvent", specialEventSchema);

module.exports = SpecialEvent;

