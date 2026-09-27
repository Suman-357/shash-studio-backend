const mongoose = require("mongoose");

const workshopSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: [true, "Workshop slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    title: {
      type: String,
      required: [true, "Workshop title is required"],
      trim: true,
    },
    titleKn: {
      type: String,
      required: [true, "Kannada title is required"],
      trim: true,
    },
    section: {
      type: String,
      required: true,
      default: "yoga",
      lowercase: true,
      trim: true,
      index: true,
    },
    sectionLabel: {
      type: String,
      default: "Yoga",
    },
    sectionLabelKn: {
      type: String,
      default: "ಯೋಗ",
    },
    category: {
      type: String,
      required: true,
      enum: [
        "holistic",
        "sleep",
        "women",
        "strength",
        "vinyasa",
        "kids",
        "sound",
        "pranayama",
        "chanting",
        "cooking",
        "retreat",
        "other",
        "combo"
      ],
      index: true
    },
    categoryLabel: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true,
    },
    descriptionKn: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: [true, "Workshop price is required"],
      min: [0, "Price cannot be negative"],
    },
    originalPrice: {
      type: Number,
      default: 0,
    },
    duration: {
      type: String,
      default: "60 Mins",
    },
    timingSlot: {
      type: String,
      required: true,
    },
    timingIcon: {
      type: String,
      default: "schedule",
    },
    badge: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    features: [
      {
        type: String,
        trim: true,
      },
    ],
    spotsLeft: {
      type: Number,
      default: 10,
      min: 0,
    },
    zoomLink: {
      type: String,
      trim: true,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for formatted price
workshopSchema.virtual("formattedPrice").get(function () {
  return `₹${this.price}`;
});

const Workshop = mongoose.model("Workshop", workshopSchema);

module.exports = Workshop;
