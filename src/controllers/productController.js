const Product = require("../models/Product");
const ProductOrder = require("../models/ProductOrder");
const ApiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");

/**
 * @desc    Get all store products
 * @route   GET /api/v1/products
 * @access  Public
 */
const getProducts = async (req, res, next) => {
  try {
    const { category, inStock } = req.query;
    const query = {};

    if (category && category !== "all") {
      query.category = category;
    }
    if (inStock === "true") {
      query.inStock = true;
    }

    const products = await Product.find(query).sort({ price: 1 });
    return ApiResponse.success(res, products, "Products fetched successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single product by ID or Slug
 * @route   GET /api/v1/products/:idOrSlug
 * @access  Public
 */
const getProductByIdOrSlug = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    let product;

    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(idOrSlug);
    } else {
      product = await Product.findOne({ slug: idOrSlug.toLowerCase() });
    }

    if (!product) {
      return next(ApiError.notFound(`Product not found: ${idOrSlug}`));
    }

    return ApiResponse.success(res, product, "Product details retrieved");
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new product (Admin)
 * @route   POST /api/v1/products
 * @access  Private (Admin)
 */
const createProduct = async (req, res, next) => {
  try {
    const { slug, title, titleKn, price, originalPrice } = req.body;
    if (!slug || !title || !titleKn || !price || !originalPrice) {
      return next(ApiError.badRequest("Slug, Title, Kannada Title, Price and Original Price are required"));
    }

    const existing = await Product.findOne({ slug: slug.toLowerCase() });
    if (existing) {
      return next(ApiError.conflict(`Product with slug '${slug}' already exists`));
    }

    const product = await Product.create(req.body);
    return ApiResponse.created(res, product, "Product created successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update product details (Admin)
 * @route   PUT /api/v1/products/:id
 * @access  Private (Admin)
 */
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!product) {
      return next(ApiError.notFound(`Product not found with id ${id}`));
    }

    return ApiResponse.success(res, product, "Product updated successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete product (Admin)
 * @route   DELETE /api/v1/products/:id
 * @access  Private (Admin)
 */
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return next(ApiError.notFound(`Product not found with id ${id}`));
    }

    return ApiResponse.success(res, null, "Product deleted successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create product customer order (Checkout)
 * @route   POST /api/v1/products/orders
 * @access  Public
 */
const createProductOrder = async (req, res, next) => {
  try {
    const {
      productId,
      quantity = 1,
      customerName,
      phone,
      email,
      shippingAddress,
      orderNotes
    } = req.body;

    if (!productId || !customerName || !phone || !shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.pincode) {
      return next(ApiError.badRequest("Please provide product details, customer name, phone, and complete shipping address"));
    }

    const cleanedPhone = String(phone).replace(/[^0-9]/g, "");
    if (!/^[0-9]{10,12}$/.test(cleanedPhone)) {
      return next(ApiError.badRequest("Please provide a valid 10 to 12 digit phone number."));
    }

    const cleanedPincode = String(shippingAddress.pincode).trim();
    if (!/^[0-9]{6}$/.test(cleanedPincode)) {
      return next(ApiError.badRequest("Please provide a valid 6-digit pincode."));
    }

    // Resolve price strictly from database
    const isObjectId = typeof productId === "string" && Boolean(productId.match(/^[0-9a-fA-F]{24}$/));
    const product = await Product.findOne({
      $or: [
        { slug: String(productId).toLowerCase().trim() },
        ...(isObjectId ? [{ _id: productId }] : []),
      ],
    });

    if (!product) {
      return next(ApiError.notFound(`Product not found: ${productId}`));
    }
    if (!product.inStock) {
      return next(ApiError.badRequest(`"${product.title}" is currently out of stock.`));
    }

    const numQty = Math.max(1, Math.min(10, Math.floor(Number(quantity) || 1)));
    if (typeof product.stockQuantity === "number" && product.stockQuantity < numQty) {
      return next(
        ApiError.badRequest(
          `Only ${product.stockQuantity} ${product.stockQuantity === 1 ? "unit is" : "units are"} left in stock for "${product.title}".`
        )
      );
    }

    const price = product.price;
    if (typeof price !== "number" || price <= 0) {
      return next(ApiError.badRequest("Invalid product price configured."));
    }
    const totalAmount = price * numQty;

    // Generate unique order ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `SHASH-MAT-${Date.now().toString().slice(-4)}${randomSuffix}`;

    // All public orders require online Razorpay verification before confirmation and stock deduction
    const order = await ProductOrder.create({
      orderId,
      productId: String(product._id),
      productTitle: product.title,
      unitPrice: price,
      quantity: numQty,
      totalAmount,
      customerName: String(customerName).trim(),
      phone: cleanedPhone,
      email: String(email || "").trim().toLowerCase(),
      shippingAddress: {
        street: String(shippingAddress.street).trim(),
        city: String(shippingAddress.city).trim(),
        state: String(shippingAddress.state || "Karnataka").trim(),
        pincode: cleanedPincode
      },
      paymentMethod: "razorpay",
      orderStatus: "pending_payment",
      orderNotes: String(orderNotes || "").trim()
    });

    return ApiResponse.created(
      res,
      {
        orderId: order.orderId,
        customerName: order.customerName,
        phone: order.phone,
        productTitle: order.productTitle,
        quantity: order.quantity,
        totalAmount: order.totalAmount,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt
      },
      "Order placed successfully! Delivery tracking details will be sent on WhatsApp."
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all product orders (Admin)
 * @route   GET /api/v1/products/orders/all
 * @access  Private (Admin)
 */
const getAllProductOrders = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status && status !== "all") {
      query.orderStatus = status;
    }

    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { orderId: { $regex: search, $options: "i" } },
        { productTitle: { $regex: search, $options: "i" } }
      ];
    }

    const orders = await ProductOrder.find(query).sort({ createdAt: -1 });
    return ApiResponse.success(res, orders, "Product orders retrieved successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update order status (Admin)
 * @route   PUT /api/v1/products/orders/:id/status
 * @access  Private (Admin)
 */
const updateProductOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { orderStatus, courierPartner, trackingNumber, orderNotes } = req.body;

    const updateFields = {};
    if (orderStatus) updateFields.orderStatus = orderStatus;
    if (courierPartner) updateFields.courierPartner = courierPartner;
    if (trackingNumber !== undefined) updateFields.trackingNumber = trackingNumber;
    if (orderNotes !== undefined) updateFields.orderNotes = orderNotes;

    const order = await ProductOrder.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true
    });

    if (!order) {
      return next(ApiError.notFound(`Order not found with id ${id}`));
    }

    return ApiResponse.success(res, order, "Order status updated successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductByIdOrSlug,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductOrder,
  getAllProductOrders,
  updateProductOrderStatus
};
