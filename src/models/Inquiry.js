const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 100
    },
    whatsapp: {
      type: String,
      required: [true, "WhatsApp number is required"],
      trim: true
    },
    program: {
      type: String,
      default: "General Query / Scholarship",
      trim: true
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: 2000
    },
    status: {
      type: String,
      enum: ["new", "contacted", "resolved"],
      default: "new",
      index: true
    },
    notes: {
      type: String,
      default: ""
    },
    consentGiven: {
      type: Boolean,
      required: [true, "Consent to contact via WhatsApp/Email is required"],
      default: false
    },
    consentTimestamp: {
      type: Date,
      default: Date.now
    },
    consentIp: {
      type: String,
      trim: true,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

const Inquiry = mongoose.model("Inquiry", inquirySchema);

module.exports = Inquiry;
