const express = require("express");
const router = express.Router();

const workshopRoutes = require("./workshopRoutes");
const batchRoutes = require("./batchRoutes");
const registrationRoutes = require("./registrationRoutes");
const inquiryRoutes = require("./inquiryRoutes");
const authRoutes = require("./authRoutes");
const sectionRoutes = require("./sectionRoutes");
const productRoutes = require("./productRoutes");

// Health check
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "SHASH Studios API",
    location: "Mysuru, Karnataka",
    timestamp: new Date().toISOString()
  });
});

// Mount resource routers
router.use("/workshops", workshopRoutes);
router.use("/batches", batchRoutes);
router.use("/registrations", registrationRoutes);
router.use("/inquiries", inquiryRoutes);
router.use("/auth", authRoutes);
router.use("/sections", sectionRoutes);
router.use("/products", productRoutes);

module.exports = router;
