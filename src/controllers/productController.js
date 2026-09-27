const Product = require("../models/Product");
const ProductOrder = require("../models/ProductOrder");
const ApiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");

// Default initial 3 products for automatic seeding
const INITIAL_PRODUCTS = [
  {
    slug: "cotton-mat",
    title: "Mysuru Heritage Handloom Cotton & Jute Yoga Mat",
    titleKn: "ಕೈಮಗ್ಗದ ಮೈಸೂರು ಸಾವಯವ ಹತ್ತಿ & ಸೆಣಬಿನ ಯೋಗ ಚಾಪೆ",
    subtitle: "100% Biodegradable • Handwoven by Traditional Mysuru Weavers",
    subtitleKn: "೧೦೦% ನೈಸರ್ಗಿಕ ಹತ್ತಿ ಮತ್ತು ಸೆಣಬು • ಪಾರಂಪರಿಕ ಮೈಸೂರು ನೇಯ್ಗೆ",
    category: "mats",
    badge: "Mysuru Handloom Heritage",
    badgeKn: "ಕೈಮಗ್ಗದ ಪರಂಪರೆ",
    badgeColor: "bg-[#D48C46]",
    image: "/src/assets/mysuru_organic_cotton_mat.jpg",
    price: 1499,
    originalPrice: 1999,
    rating: 4.9,
    reviewsCount: 52,
    inStock: true,
    stockQuantity: 45,
    tag: "Authentic Sadhana",
    description:
      "Crafted with pure organic Indian cotton and resilient natural jute yarn, featuring an unbleached tree-rubber ribbed backing to ensure slip-free grounding. Designed specifically for Ashtanga Vinyasa sweat absorption, joint breathability, and deep meditation.",
    descriptionKn:
      "ಅಷ್ಟಾಂಗ ವಿನ್ಯಾಸ ಹಾಗೂ ಧ್ಯಾಸಕ್ಕೆ ಹೇಳಿಮಾಡಿಸಿದ ನೈಸರ್ಗಿಕ ಹತ್ತಿ ಮತ್ತು ಸೆಣಬಿನ ಚಾಪೆ. ಬೆವರು ಹೀರಿಕೊಂಡು ಜಾರದಂತೆ ಹಿಡಿತ ನೀಡುವ ನೈಸರ್ಗಿಕ ರಬ್ಬರ್ ಬೆಂಬಲ ಹೊಂದಿದೆ.",
    highlights: [
      "100% Organic Cotton & Jute Weave with Natural Tree Rubber Grip",
      "Superior Sweat Absorption for Dynamic Mysore Ashtanga Practice",
      "Hypoallergenic, Toxin-Free & Biodegradable (Eco-Conscious)",
      "Traditional Central Asana Alignment Line Weave",
      "Lightweight & Washable with Included Cotton Carrying Sling"
    ],
    specs: [
      { label: "Dimensions", value: "72″ × 26″ (183cm × 66cm)" },
      { label: "Thickness", value: "5mm Grounding Cushion" },
      { label: "Weight", value: "1.3 kg (Travel Friendly)" },
      { label: "Material", value: "Organic Cotton + Jute + Tree Rubber" }
    ]
  },
  {
    slug: "progrip-mat",
    title: "SHASH Pro-Grip Asana Alignment Eco-Rubber Mat",
    titleKn: "ಪ್ರೊ-ಗ್ರಿಪ್ ಆಸನ ಅಲೈನ್ಮೆಂಟ್ ಇಕೋ-ರಬ್ಬರ್ ಯೋಗ ಚಾಪೆ",
    subtitle: "Laser-Etched Precision Sacred Geometry • Zero-Slip Wet & Dry Lock",
    subtitleKn: "ಲೇಸರ್ ಕೆತ್ತನೆಯ ಆಸನ ಮಾರ್ಗದರ್ಶಿ ರೇಖೆಗಳು • ಗರಿಷ್ಠ ಜಾರದ ಹಿಡಿತ",
    category: "mats",
    badge: "Studio Best-Seller",
    badgeKn: "ಶಾಲಾ ಬೆಸ್ಟ್-ಸೆಲ್ಲರ್",
    badgeColor: "bg-[#1C3325]",
    image: "/src/assets/progrip_rubber_yoga_mat.jpg",
    price: 2199,
    originalPrice: 2799,
    rating: 5.0,
    reviewsCount: 78,
    inStock: true,
    stockQuantity: 30,
    tag: "Pro Studio Performance",
    description:
      "Engineered for maximum stability and joint longevity. Laser-etched precision alignment markers guide your hands and feet safely into asana symmetry. Features high-density sustainable natural tree rubber with a smooth, sweat-activated non-slip matte surface.",
    descriptionKn:
      "ಕೀಲುಗಳ ರಕ್ಷಣೆಗಾಗಿ ೫ ಮಿಮೀ ದಪ್ಪನೆಯ ನೈಸರ್ಗಿಕ ರಬ್ಬರ್. ಸರಿಯಾದ ಭಂಗಿ ಮತ್ತು ಸುರಕ್ಷಿತ ಆಸನಕ್ಕಾಗಿ ಲೇಸರ್ ಕೆತ್ತನೆಯ ಮಾರ್ಗದರ್ಶಿ ರೇಖೆಗಳನ್ನು ಹೊಂದಿದೆ.",
    highlights: [
      "Laser-Etched Central & 45° Asana Alignment Guidance System",
      "Wet & Dry Instant Grip — Never Slips Even in High Sweat Sessions",
      "High-Density 5mm Natural Tree Rubber Protects Knees & Wrists",
      "Anti-Tear & Odor-Resistant Eco-Friendly Polyurethane Surface",
      "Includes Premium Studio Carry Strap with Brass Buckles"
    ],
    specs: [
      { label: "Dimensions", value: "72″ × 26.8″ (183cm × 68cm)" },
      { label: "Thickness", value: "5mm High-Density Cushion" },
      { label: "Weight", value: "2.4 kg (Dense Anti-Bunch)" },
      { label: "Material", value: "Sustainable Natural Tree Rubber + PU" }
    ]
  },
  {
    slug: "cork-props-kit",
    title: "Mysuru Natural Cork Yoga Blocks & Alignment Strap Duo",
    titleKn: "ಮೈಸೂರು ನೈಸರ್ಗಿಕ ಓಕ್ ಕಾರ್ಕ್ ಬ್ಲಾಕ್ಸ್ & ಯೋಗ ಸ್ಟ್ರಾಪ್ ಕಿಟ್",
    subtitle: "High-Density Biodegradable Cork • 8ft Organic Cotton D-Ring Strap",
    subtitleKn: "ಸಾವಯವ ಓಕ್ ಕಾರ್ಕ್ ಮತ್ತು ಗಟ್ಟಿಮುಟ್ಟಾದ ನೈಸರ್ಗಿಕ ಹತ್ತಿ ಸ್ಟ್ರಾಪ್",
    category: "props",
    badge: "Essential Alignment Duo",
    badgeKn: "ಅಗತ್ಯ ಆಸನ ಸಾಧನ",
    badgeColor: "bg-[#7B4C28]",
    image: "/src/assets/cork_yoga_blocks_strap_set.jpg",
    price: 899,
    originalPrice: 1299,
    rating: 4.9,
    reviewsCount: 39,
    inStock: true,
    stockQuantity: 50,
    tag: "Asana Alignment Props",
    description:
      "Crafted from 100% sustainable Portuguese oak cork with bevelled non-slip comfort edges, paired with an unbleached 8-foot organic cotton alignment strap featuring antique bronze D-rings. Perfect for modifying difficult postures, deepening stretches safely, and relieving joint tension during Mysore Ashtanga practice.",
    descriptionKn:
      "ಕಷ್ಟಕರ ಆಸನಗಳನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ಮಾಡಲು ನೆರವಾಗುವ ನೈಸರ್ಗಿಕ ಓಕ್ ಕಾರ್ಕ್ ಬ್ಲಾಕ್‌ಗಳು ಮತ್ತು ಗಟ್ಟಿಮುಟ್ಟಾದ ಹತ್ತಿ ಸ್ಟ್ರಾಪ್. ಕೀಲುಗಳಿಗೆ ನೋವಾಗದಂತೆ ದೃಢವಾದ ಬೆಂಬಲ ನೀಡುತ್ತದೆ.",
    highlights: [
      "Pair of 2 High-Density 100% Natural Cork Yoga Blocks (9″ × 6″ × 4″)",
      "8-Foot Extra-Long Organic Cotton Strap with Dual Metal D-Ring Buckles",
      "Bevelled Contour Edges for Secure Hand & Wrist Grip",
      "Firm, Non-Compressible Stability for Safe Deep Spine & Hamstring Opening",
      "Antimicrobial, Sweat-Resistant & 100% Biodegradable"
    ],
    specs: [
      { label: "Block Size", value: "9″ × 6″ × 4″ (Pair of 2 Blocks)" },
      { label: "Strap Length", value: "8 Feet (240cm) × 1.5″ Wide" },
      { label: "Weight", value: "850g per block + 120g strap" },
      { label: "Material", value: "Natural Cork + 100% Organic Cotton" }
    ]
  }
];

/**
 * @desc    Get all store products (auto-seeds on first request if empty)
 * @route   GET /api/v1/products
 * @access  Public
 */
const getProducts = async (req, res, next) => {
  try {
    let count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany(INITIAL_PRODUCTS);
    }

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
      productTitle,
      unitPrice,
      quantity = 1,
      customerName,
      phone,
      email,
      shippingAddress,
      paymentMethod = "cod",
      orderNotes
    } = req.body;

    if (!productId || !customerName || !phone || !shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.pincode) {
      return next(ApiError.badRequest("Please provide product details, customer name, phone, and complete shipping address"));
    }

    const numQty = Number(quantity) || 1;
    const price = Number(unitPrice) || 0;
    const totalAmount = price * numQty;

    // Generate unique order ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `SHASH-MAT-${Date.now().toString().slice(-4)}${randomSuffix}`;

    const order = await ProductOrder.create({
      orderId,
      productId,
      productTitle,
      unitPrice: price,
      quantity: numQty,
      totalAmount,
      customerName,
      phone,
      email: email || "",
      shippingAddress,
      paymentMethod,
      orderNotes: orderNotes || ""
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
