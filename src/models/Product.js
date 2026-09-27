const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: [true, "Product slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true
    },
    titleKn: {
      type: String,
      required: [true, "Kannada title is required"],
      trim: true
    },
    subtitle: {
      type: String,
      trim: true,
      default: ""
    },
    subtitleKn: {
      type: String,
      trim: true,
      default: ""
    },
    category: {
      type: String,
      enum: ["mats", "props", "wellness", "accessories"],
      default: "mats",
      index: true
    },
    badge: {
      type: String,
      default: "Studio Original"
    },
    badgeKn: {
      type: String,
      default: "ಶಾಲಾ ವಿಶೇಷ"
    },
    badgeColor: {
      type: String,
      default: "bg-[#1C3325]"
    },
    image: {
      type: String,
      required: [true, "Product image is required"]
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"]
    },
    originalPrice: {
      type: Number,
      required: [true, "Original MRP is required"],
      min: [0, "Original price cannot be negative"]
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5
    },
    reviewsCount: {
      type: Number,
      default: 1
    },
    inStock: {
      type: Boolean,
      default: true,
      index: true
    },
    stockQuantity: {
      type: Number,
      default: 50
    },
    tag: {
      type: String,
      default: "Studio Equipment"
    },
    description: {
      type: String,
      default: ""
    },
    descriptionKn: {
      type: String,
      default: ""
    },
    highlights: {
      type: [String],
      default: []
    },
    specs: [
      {
        label: { type: String, required: true },
        value: { type: String, required: true }
      }
    ]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

productSchema.virtual("discountPercentage").get(function () {
  if (!this.originalPrice || this.originalPrice <= this.price) return 0;
  return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
});

module.exports = mongoose.model("Product", productSchema);
