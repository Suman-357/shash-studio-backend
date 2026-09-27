const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true
    },
    fullName: {
      type: String,
      required: [true, "Student name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100
    },
    whatsapp: {
      type: String,
      required: [true, "WhatsApp number is required"],
      trim: true,
      match: [/^[0-9]{10,12}$/, "Please enter a valid WhatsApp number"],
      index: true
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
      index: true
    },
    workshopId: {
      type: String,
      required: true,
      trim: true
    },
    workshopTitle: {
      type: String,
      required: true,
      trim: true
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      default: null,
      index: true
    },
    slot: {
      type: String,
      required: [true, "Batch slot is required"],
      trim: true
    },
    // Immutable snapshot of the slot at time of booking
    originalSlotSnapshot: {
      slotTime: { type: String, default: "" },
      batchTitle: { type: String, default: "" },
      bookedAt: { type: Date, default: Date.now }
    },
    // Audit log if admin or student migrates/updates slot
    rescheduleHistory: [
      {
        fromSlotTime: String,
        toSlotTime: String,
        fromBatchId: { type: mongoose.Schema.Types.ObjectId, ref: "Batch" },
        toBatchId: { type: mongoose.Schema.Types.ObjectId, ref: "Batch" },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: String, enum: ["admin", "student_request", "system"], default: "admin" },
        reason: { type: String, default: "" },
        studentNotified: { type: Boolean, default: false }
      }
    ],
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: "INR"
    },
    languagePref: {
      type: String,
      enum: ["both", "kannada", "english"],
      default: "both"
    },
    healthNotes: {
      type: String,
      default: "beginner",
      trim: true
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "completed", // By default marked completed for instant demo enrollment
      index: true
    },
    paymentMethod: {
      type: String,
      enum: ["upi", "card", "netbanking", "whatsapp_manual"],
      default: "upi"
    },
    upiReference: {
      type: String,
      trim: true,
      default: ""
    },
    zoomInviteSent: {
      type: Boolean,
      default: false
    },
    consentGiven: {
      type: Boolean,
      required: [true, "Consent to terms and communications is required"],
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

// Pre-validate hook to generate booking ID if absent
registrationSchema.pre("validate", function (next) {
  if (!this.bookingId) {
    const randomCode = Math.floor(100000 + Math.random() * 900000);
    this.bookingId = `SHASH-${randomCode}`;
  }
  next();
});

const Registration = mongoose.model("Registration", registrationSchema);

module.exports = Registration;
