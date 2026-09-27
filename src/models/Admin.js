const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const env = require("../config/env");

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Admin name is required"],
      trim: true
    },
    email: {
      type: String,
      required: [true, "Admin email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false // Excluded by default from queries
    },
    role: {
      type: String,
      enum: ["superadmin", "coordinator", "instructor"],
      default: "coordinator"
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
adminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate signed JWT token
adminSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role, email: this.email },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRE }
  );
};

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
