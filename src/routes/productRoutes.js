const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductByIdOrSlug,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductOrder,
  getAllProductOrders,
  updateProductOrderStatus
} = require("../controllers/productController");
const { protect, authorize } = require("../middlewares/authMiddleware");

// Public routes
router.get("/", getProducts);
router.post("/orders", createProductOrder);
router.get("/:idOrSlug", getProductByIdOrSlug);

// Admin-protected routes
router.post("/", protect, authorize("superadmin", "coordinator"), createProduct);
router.put("/:id", protect, authorize("superadmin", "coordinator"), updateProduct);
router.delete("/:id", protect, authorize("superadmin"), deleteProduct);

// Admin orders management routes
router.get("/orders/all", protect, authorize("superadmin", "coordinator"), getAllProductOrders);
router.put("/orders/:id/status", protect, authorize("superadmin", "coordinator"), updateProductOrderStatus);

module.exports = router;
