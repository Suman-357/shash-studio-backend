const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: [true, "Section slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    name: {
      type: String,
      required: [true, "Section name is required"],
      trim: true
    },
    nameKn: {
      type: String,
      required: [true, "Kannada section name is required"],
      trim: true
    },
    icon: {
      type: String,
      default: "spa",
      trim: true
    },
    emoji: {
      type: String,
      default: "✨",
      trim: true
    },
    tagline: {
      type: String,
      default: "",
      trim: true
    },
    taglineKn: {
      type: String,
      default: "",
      trim: true
    },
    badge: {
      type: String,
      default: "",
      trim: true
    },
    badgeKn: {
      type: String,
      default: "",
      trim: true
    },
    accentColor: {
      type: String,
      default: "#1C3325"
    },
    lightBg: {
      type: String,
      default: "bg-[#F4F8F5]"
    },
    borderCol: {
      type: String,
      default: "border-[#1C3325]/15"
    },
    order: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

const Section = mongoose.model("Section", sectionSchema);

module.exports = Section;
