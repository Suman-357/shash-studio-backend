const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const env = require("../config/env");
const Registration = require("../models/Registration");
const ProductOrder = require("../models/ProductOrder");
const Workshop = require("../models/Workshop");
const Product = require("../models/Product");
const ApiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");

/**
 * Constant-time comparison helper to prevent side-channel timing attacks
 */
const timingSafeEqual = (a, b) => {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
};

/**
 * @desc    Create a Razorpay order (server-side)
 * @route   POST /api/v1/payments/create-order
 * @access  Public
 *
 * Strictly binds the Razorpay order and amount to the existing database
 * Registration (bookingId) or ProductOrder (orderId) record to prevent
 * price-swapping or cross-item substitution attacks.
 */
const createOrder = async (req, res, next) => {
  try {
    const {
      type = "workshop",
      workshopId,
      productId,
      quantity,
      currency = "INR",
      receipt,
      notes = {},
      bookingId,
      orderId,
    } = req.body;

    const resolvedBookingId = (bookingId || notes.bookingId || "").trim().toUpperCase();
    const resolvedOrderId = (orderId || notes.orderId || "").trim();

    let amountInRupees = 0;
    let itemTitle = "";

    // ──── 1. Workshop Payment Order ────
    if (type === "workshop") {
      if (!resolvedBookingId) {
        return next(ApiError.badRequest("bookingId is required to create a workshop payment order."));
      }

      const reg = await Registration.findOne({ bookingId: resolvedBookingId });
      if (!reg) {
        return next(ApiError.notFound(`Registration record not found for booking: ${resolvedBookingId}`));
      }

      if (reg.paymentStatus === "completed") {
        return next(ApiError.badRequest("This workshop registration has already been paid."));
      }

      // Resolve workshop from the registration's bound workshopId
      const targetWorkshopId = reg.workshopId;
      const isObjectId = typeof targetWorkshopId === "string" && Boolean(targetWorkshopId.match(/^[0-9a-fA-F]{24}$/));
      const workshop = await Workshop.findOne({
        $or: [
          { slug: String(targetWorkshopId).toLowerCase().trim() },
          ...(isObjectId ? [{ _id: targetWorkshopId }] : []),
        ],
      });

      if (!workshop || !workshop.isActive) {
        return next(ApiError.notFound(`Workshop not found or inactive: ${targetWorkshopId}`));
      }

      // Reject if client attempted to pass a mismatched workshopId
      if (
        workshopId &&
        String(workshopId).toLowerCase().trim() !== workshop.slug &&
        String(workshopId).trim() !== String(workshop._id)
      ) {
        return next(ApiError.badRequest("Workshop mismatch with registration record."));
      }

      if (typeof workshop.spotsLeft === "number" && workshop.spotsLeft <= 0) {
        return next(ApiError.badRequest("This workshop batch is currently full."));
      }

      if (typeof workshop.price !== "number" || workshop.price <= 0) {
        return next(ApiError.badRequest("This workshop requires direct inquiry and cannot be paid online."));
      }

      amountInRupees = workshop.price;
      itemTitle = workshop.title;

      // Ensure registration amount is synced with authoritative workshop price
      reg.amount = amountInRupees;
      await reg.save();

    // ──── 2. Product Payment Order ────
    } else if (type === "product") {
      if (!resolvedOrderId) {
        return next(ApiError.badRequest("orderId is required to create a product payment order."));
      }

      const prodOrder = await ProductOrder.findOne({ orderId: resolvedOrderId });
      if (!prodOrder) {
        return next(ApiError.notFound(`Product order not found: ${resolvedOrderId}`));
      }

      if (prodOrder.orderStatus !== "pending_payment") {
        return next(ApiError.badRequest(`Order ${resolvedOrderId} is already ${prodOrder.orderStatus}.`));
      }

      const isObjectId = typeof prodOrder.productId === "string" && Boolean(prodOrder.productId.match(/^[0-9a-fA-F]{24}$/));
      const product = await Product.findOne({
        $or: [
          ...(isObjectId ? [{ _id: prodOrder.productId }] : []),
          { slug: String(prodOrder.productId).toLowerCase().trim() },
        ],
      });

      if (!product) {
        return next(ApiError.notFound("Product associated with this order was not found."));
      }

      if (!product.inStock) {
        return next(ApiError.badRequest(`"${product.title}" is currently out of stock.`));
      }

      // Reject if client passed a mismatched productId or quantity
      if (
        productId &&
        String(productId).toLowerCase().trim() !== product.slug &&
        String(productId).trim() !== String(product._id)
      ) {
        return next(ApiError.badRequest("Product mismatch with order record."));
      }

      if (quantity !== undefined && Number(quantity) !== prodOrder.quantity) {
        return next(ApiError.badRequest("Order quantity mismatch."));
      }

      if (typeof product.stockQuantity === "number" && product.stockQuantity < prodOrder.quantity) {
        return next(
          ApiError.badRequest(
            `Only ${product.stockQuantity} unit(s) left in stock for "${product.title}".`
          )
        );
      }

      amountInRupees = product.price * prodOrder.quantity;
      itemTitle = product.title;

      // Sync authoritative price on order record
      prodOrder.unitPrice = product.price;
      prodOrder.totalAmount = amountInRupees;
      await prodOrder.save();

    } else {
      return next(ApiError.badRequest("type must be 'workshop' or 'product'."));
    }

    if (amountInRupees <= 0) {
      return next(ApiError.badRequest("Resolved amount is zero or negative. Cannot create order."));
    }

    const amountInPaise = Math.round(amountInRupees * 100);

    // Enforce sanitized server-authoritative notes
    const safeNotes = {
      type,
      itemTitle,
      ...(resolvedBookingId && { bookingId: resolvedBookingId }),
      ...(resolvedOrderId && { orderId: resolvedOrderId }),
    };

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: receipt || `rcpt_${type}_${Date.now()}`,
      notes: safeNotes,
    };

    const order = await razorpay.orders.create(options);

    // Cryptographically/Data-bind the Razorpay Order ID to the existing registration or product order record
    if (type === "workshop" && resolvedBookingId) {
      await Registration.findOneAndUpdate(
        { bookingId: resolvedBookingId },
        { razorpayOrderId: order.id }
      );
    }
    if (type === "product" && resolvedOrderId) {
      await ProductOrder.findOneAndUpdate(
        { orderId: resolvedOrderId },
        { razorpayOrderId: order.id }
      );
    }

    return ApiResponse.success(
      res,
      {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: env.RAZORPAY_KEY_ID,
      },
      "Razorpay order created successfully"
    );
  } catch (error) {
    console.error("Razorpay create-order error:", error);
    return next(ApiError.internal("Failed to create payment order. Please try again."));
  }
};

/**
 * @desc    Verify Razorpay payment signature & finalise booking
 * @route   POST /api/v1/payments/verify
 * @access  Public
 */
const verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      type = "workshop",
      bookingId,
      orderId,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return next(ApiError.badRequest("Missing Razorpay payment verification parameters."));
    }

    if (type !== "workshop" && type !== "product") {
      return next(ApiError.badRequest("Invalid payment type."));
    }

    if (type === "workshop" && !bookingId) {
      return next(ApiError.badRequest("bookingId is required for workshop payment verification."));
    }

    if (type === "product" && !orderId) {
      return next(ApiError.badRequest("orderId is required for product payment verification."));
    }

    if (!env.RAZORPAY_KEY_SECRET) {
      return next(ApiError.internal("Payment gateway secret is not configured on server."));
    }

    // 1. ---- Constant-Time Signature verification ----
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    const isAuthentic = timingSafeEqual(expectedSignature, razorpay_signature);

    if (!isAuthentic) {
      if (type === "workshop" && bookingId) {
        await Registration.findOneAndUpdate(
          { bookingId: String(bookingId).toUpperCase(), paymentStatus: { $ne: "completed" } },
          { paymentStatus: "failed" }
        );
      }
      if (type === "product" && orderId) {
        await ProductOrder.findOneAndUpdate(
          { orderId: String(orderId), orderStatus: { $ne: "confirmed" } },
          { orderStatus: "cancelled" }
        );
      }
      return next(ApiError.badRequest("Payment verification failed. Signature mismatch."));
    }

    // 2. ---- Cross-Collection Replay / Double-Spending Prevention ----
    const normalizedBookingId = bookingId ? String(bookingId).toUpperCase() : "";
    const normalizedOrderId = orderId ? String(orderId) : "";

    const [claimedByRegistration, claimedByProductOrder] = await Promise.all([
      Registration.findOne({
        razorpayPaymentId: razorpay_payment_id,
        ...(type === "workshop" ? { bookingId: { $ne: normalizedBookingId } } : {}),
      }),
      ProductOrder.findOne({
        razorpayPaymentId: razorpay_payment_id,
        ...(type === "product" ? { orderId: { $ne: normalizedOrderId } } : {}),
      }),
    ]);

    if (claimedByRegistration || claimedByProductOrder) {
      return next(ApiError.badRequest("This payment ID has already been claimed by another order."));
    }

    // 3. ---- Fetch order from Razorpay gateway (Fail-Closed) ----
    let rzpOrder = null;
    try {
      rzpOrder = await razorpay.orders.fetch(razorpay_order_id);
    } catch (fetchErr) {
      console.error("Failed to fetch order from Razorpay for verification:", fetchErr.message);
      return next(ApiError.internal("Unable to verify order details with payment gateway. Please try again."));
    }

    if (!rzpOrder || !rzpOrder.amount) {
      return next(ApiError.badRequest("Invalid order returned from payment gateway."));
    }

    // 4. ---- Validate Order Binding & Amount, Then Update Record Idempotently ----
    let updatedRecord = null;

    if (type === "workshop") {
      const reg = await Registration.findOne({ bookingId: normalizedBookingId });
      if (!reg) {
        return next(ApiError.notFound(`Registration record not found for booking: ${normalizedBookingId}`));
      }

      // Enforce strict binding: the Razorpay order ID must match the one generated for this booking
      if (!reg.razorpayOrderId || reg.razorpayOrderId !== razorpay_order_id) {
        return next(ApiError.badRequest("Order ID does not match this workshop booking."));
      }

      const expectedPaise = Math.round((reg.amount || 0) * 100);
      if (expectedPaise <= 0 || rzpOrder.amount !== expectedPaise) {
        return next(ApiError.badRequest("Paid amount does not match workshop registration amount."));
      }

      const isAlreadyCompleted = reg.paymentStatus === "completed";

      reg.paymentStatus = "completed";
      reg.paymentMethod = "razorpay";
      reg.razorpayOrderId = razorpay_order_id;
      reg.razorpayPaymentId = razorpay_payment_id;
      reg.razorpaySignature = razorpay_signature;
      updatedRecord = await reg.save();

      // Decrement spotsLeft once upon successful payment
      if (!isAlreadyCompleted) {
        await Workshop.findOneAndUpdate(
          { slug: reg.workshopId, spotsLeft: { $gt: 0 } },
          { $inc: { spotsLeft: -1 } }
        );
      }
    }

    if (type === "product") {
      const prodOrder = await ProductOrder.findOne({ orderId: normalizedOrderId });
      if (!prodOrder) {
        return next(ApiError.notFound(`Product order not found: ${normalizedOrderId}`));
      }

      // Enforce strict binding: the Razorpay order ID must match the one generated for this product order
      if (!prodOrder.razorpayOrderId || prodOrder.razorpayOrderId !== razorpay_order_id) {
        return next(ApiError.badRequest("Order ID does not match this product order."));
      }

      const expectedPaise = Math.round((prodOrder.totalAmount || 0) * 100);
      if (expectedPaise <= 0 || rzpOrder.amount !== expectedPaise) {
        return next(ApiError.badRequest("Paid amount does not match product order total."));
      }

      const wasAlreadyConfirmed = prodOrder.orderStatus === "confirmed";

      prodOrder.paymentMethod = "razorpay";
      prodOrder.orderStatus = "confirmed";
      prodOrder.razorpayOrderId = razorpay_order_id;
      prodOrder.razorpayPaymentId = razorpay_payment_id;
      prodOrder.razorpaySignature = razorpay_signature;
      updatedRecord = await prodOrder.save();

      // Decrement inventory stock once upon verified payment
      if (!wasAlreadyConfirmed) {
        const prod = await Product.findById(prodOrder.productId);
        if (prod && typeof prod.stockQuantity === "number") {
          prod.stockQuantity = Math.max(0, prod.stockQuantity - prodOrder.quantity);
          if (prod.stockQuantity === 0) {
            prod.inStock = false;
          }
          await prod.save();
        }
      }
    }

    return ApiResponse.success(
      res,
      {
        verified: true,
        type,
        ...(type === "workshop" && updatedRecord
          ? {
              bookingId: updatedRecord.bookingId,
              paymentStatus: updatedRecord.paymentStatus,
              amount: updatedRecord.amount,
            }
          : {}),
        ...(type === "product" && updatedRecord
          ? {
              orderId: updatedRecord.orderId,
              orderStatus: updatedRecord.orderStatus,
              totalAmount: updatedRecord.totalAmount,
            }
          : {}),
      },
      "Payment verified and recorded successfully!"
    );
  } catch (error) {
    console.error("Payment verification error:", error);
    return next(ApiError.internal("Payment verification failed. Please contact support."));
  }
};

/**
 * @desc    Fetch payment details from Razorpay by payment ID
 * @route   GET /api/v1/payments/:paymentId
 * @access  Private (Admin)
 */
const getPaymentDetails = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const payment = await razorpay.payments.fetch(paymentId);

    return ApiResponse.success(res, payment, "Payment details fetched from Razorpay");
  } catch (error) {
    console.error("Fetch payment error:", error);
    return next(ApiError.notFound(`Payment not found: ${req.params.paymentId}`));
  }
};

/**
 * @desc    Handle Razorpay webhook events (payment.captured, payment.failed, etc.)
 * @route   POST /api/v1/payments/webhook
 * @access  Public (verified via webhook secret)
 */
const handleWebhook = async (req, res, next) => {
  try {
    const webhookSecret = env.RAZORPAY_WEBHOOK_SECRET;

    // Fail closed: Never process webhooks if secret is not configured
    if (!webhookSecret) {
      console.error("Razorpay webhook received but RAZORPAY_WEBHOOK_SECRET is not configured.");
      return res.status(500).json({ success: false, message: "Webhook secret not configured on server" });
    }

    const receivedSignature = req.headers["x-razorpay-signature"];
    if (!receivedSignature) {
      return res.status(400).json({ success: false, message: "Missing Razorpay signature header" });
    }

    // Must use rawBody captured in app.js before JSON parsing to preserve exact payload formatting
    if (!req.rawBody) {
      return res.status(400).json({ success: false, message: "Missing raw webhook payload" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(req.rawBody)
      .digest("hex");

    const isMatch = timingSafeEqual(expectedSignature, receivedSignature);

    if (!isMatch) {
      console.warn("Webhook signature mismatch — rejecting forged or corrupt event.");
      return res.status(400).json({ success: false, message: "Invalid webhook signature" });
    }

    const event = req.body.event;
    const paymentEntity = req.body.payload?.payment?.entity;

    if (!paymentEntity) {
      return res.status(200).json({ success: true, message: "Event acknowledged (no payment entity)" });
    }

    const rzpOrderId = paymentEntity.order_id;
    const rzpPaymentId = paymentEntity.id;
    const paidAmountPaise = Number(paymentEntity.amount || 0);
    const notes = paymentEntity.notes || {};

    if (!rzpOrderId) {
      return res.status(200).json({ success: true, message: "Event acknowledged (no order_id)" });
    }

    switch (event) {
      case "payment.captured": {
        // Lookup strictly by bound razorpayOrderId
        const reg = await Registration.findOne({ razorpayOrderId: rzpOrderId });
        if (reg && reg.paymentStatus !== "completed") {
          const expectedPaise = Math.round((reg.amount || 0) * 100);
          if (expectedPaise > 0 && paidAmountPaise === expectedPaise) {
            reg.paymentStatus = "completed";
            reg.paymentMethod = "razorpay";
            reg.razorpayPaymentId = rzpPaymentId;
            await reg.save();

            await Workshop.findOneAndUpdate(
              { slug: reg.workshopId, spotsLeft: { $gt: 0 } },
              { $inc: { spotsLeft: -1 } }
            );
          } else {
            console.error(
              `Webhook amount mismatch for booking ${reg.bookingId}: expected ${expectedPaise}, got ${paidAmountPaise}`
            );
          }
        }

        const prodOrder = await ProductOrder.findOne({ razorpayOrderId: rzpOrderId });
        if (prodOrder && prodOrder.orderStatus !== "confirmed") {
          const expectedPaise = Math.round((prodOrder.totalAmount || 0) * 100);
          if (expectedPaise > 0 && paidAmountPaise === expectedPaise) {
            prodOrder.orderStatus = "confirmed";
            prodOrder.paymentMethod = "razorpay";
            prodOrder.razorpayPaymentId = rzpPaymentId;
            await prodOrder.save();

            const prod = await Product.findById(prodOrder.productId);
            if (prod && typeof prod.stockQuantity === "number") {
              prod.stockQuantity = Math.max(0, prod.stockQuantity - prodOrder.quantity);
              if (prod.stockQuantity === 0) {
                prod.inStock = false;
              }
              await prod.save();
            }
          } else {
            console.error(
              `Webhook amount mismatch for order ${prodOrder.orderId}: expected ${expectedPaise}, got ${paidAmountPaise}`
            );
          }
        }
        break;
      }

      case "payment.failed": {
        await Registration.findOneAndUpdate(
          { razorpayOrderId: rzpOrderId, paymentStatus: { $ne: "completed" } },
          { paymentStatus: "failed" }
        );
        await ProductOrder.findOneAndUpdate(
          { razorpayOrderId: rzpOrderId, orderStatus: { $ne: "confirmed" } },
          { orderStatus: "cancelled" }
        );
        break;
      }

      default:
        console.log(`Unhandled Razorpay webhook event: ${event}`);
    }

    return res.status(200).json({ success: true, message: `Webhook event '${event}' processed` });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return res.status(500).json({ success: false, message: "Webhook processing failed" });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getPaymentDetails,
  handleWebhook,
};
