const mongoose = require("mongoose");

const productOrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      required: true,
      index: true
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product"
    },
    productId: {
      type: String,
      required: true
    },
    productTitle: {
      type: String,
      required: true
    },
    unitPrice: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      default: 1,
      min: [1, "Quantity must be at least 1"]
    },
    totalAmount: {
      type: Number,
      required: true
    },
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true
    },
    phone: {
      type: String,
      required: [true, "Mobile / WhatsApp number is required"],
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: ""
    },
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, default: "Karnataka" },
      pincode: { type: String, required: true }
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "upi", "bank_transfer"],
      default: "cod"
    },
    orderStatus: {
      type: String,
      enum: ["confirmed", "processing", "dispatched", "delivered", "cancelled"],
      default: "confirmed",
      index: true
    },
    courierPartner: {
      type: String,
      default: "India Post Speed Post / Bluedart"
    },
    trackingNumber: {
      type: String,
      default: ""
    },
    orderNotes: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("ProductOrder", productOrderSchema);
