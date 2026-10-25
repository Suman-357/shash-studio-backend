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
 * Body:
 *  - type        : "workshop" | "product"
 *  - workshopId  : slug or _id (required when type = "workshop")
 *  - productId   : slug or _id (required when type = "product")
 *  - quantity    : number (only for products, default 1)
 *  - receipt     : optional short string for your reference
 *  - notes       : optional object { customerName, bookingId, orderId, ... }
 *  - bookingId   : optional booking reference for workshop
 *  - orderId     : optional order reference for product
 *
 * The amount is ALWAYS fetched from the database — never trusted from the client.
 */
const createOrder = async (req, res, next) => {
  try {
    const {
      type = "workshop",
      workshopId,
      productId,
      quantity = 1,
      currency = "INR",
      receipt,
      notes = {},
      bookingId,
      orderId,
    } = req.body;

    let amountInRupees = 0;
    let itemTitle = "";

    // ──── Resolve price strictly from database ────
    if (type === "workshop") {
      if (!workshopId) {
        return next(ApiError.badRequest("workshopId (slug or _id) is required for workshop payments."));
      }

      const isObjectId = typeof workshopId === "string" && Boolean(workshopId.match(/^[0-9a-fA-F]{24}$/));
      const workshop = await Workshop.findOne({
        $or: [
          { slug: String(workshopId).toLowerCase().trim() },
          ...(isObjectId ? [{ _id: workshopId }] : []),
        ],
      });

      if (!workshop) {
        return next(ApiError.notFound(`Workshop not found: ${workshopId}`));
      }

      amountInRupees = workshop.price;
      itemTitle = workshop.title;

    } else if (type === "product") {
      if (!productId) {
        return next(ApiError.badRequest("productId (slug or _id) is required for product payments."));
      }

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

      const qty = Math.max(1, Math.floor(Number(quantity)));
      amountInRupees = product.price * qty;
      itemTitle = product.title;

    } else {
      return next(ApiError.badRequest("type must be 'workshop' or 'product'."));
    }

    if (amountInRupees <= 0) {
      return next(ApiError.badRequest("Resolved amount is zero or negative. Cannot create order."));
    }

    const amountInPaise = Math.round(amountInRupees * 100);

    const resolvedBookingId = bookingId || notes.bookingId;
    const resolvedOrderId = orderId || notes.orderId;

    const options = {
      amount: amountInPaise,
      currency,
      receipt: receipt || `rcpt_${type}_${Date.now()}`,
      notes: {
        ...notes,
        ...(resolvedBookingId && { bookingId: String(resolvedBookingId).toUpperCase() }),
        ...(resolvedOrderId && { orderId: String(resolvedOrderId) }),
        type,
        itemTitle,
      },
    };

    const order = await razorpay.orders.create(options);

    // Cryptographically/Data-bind the Razorpay Order ID to the existing registration or product order record
    if (resolvedBookingId) {
      await Registration.findOneAndUpdate(
        { bookingId: String(resolvedBookingId).toUpperCase() },
        { razorpayOrderId: order.id }
      );
    }
    if (resolvedOrderId) {
      await ProductOrder.findOneAndUpdate(
        { orderId: String(resolvedOrderId) },
        { razorpayOrderId: order.id }
      );
    }

    return ApiResponse.success(
      res,
      {
        orderId: order.id,
        amount: order.amount,
        amountInRupees,
        currency: order.currency,
        receipt: order.receipt,
        status: order.status,
        itemTitle,
        key: env.RAZORPAY_KEY_ID, // safe to expose — this is the public key
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
 *
 * Body:
 *  razorpay_order_id, razorpay_payment_id, razorpay_signature
 *  type              : "workshop" | "product"
 *  bookingId         : SHASH-XXXXXX  (for workshop)
 *  orderId           : SHASH-MAT-... (for product)
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
      // Signature mismatch — potential tampering attempt
      if (type === "workshop" && bookingId) {
        await Registration.findOneAndUpdate(
          { bookingId: bookingId.toUpperCase() },
          { paymentStatus: "failed" }
        );
      }
      if (type === "product" && orderId) {
        await ProductOrder.findOneAndUpdate(
          { orderId },
          { orderStatus: "cancelled" }
        );
      }
      return next(ApiError.badRequest("Payment verification failed. Signature mismatch."));
    }

    // 2. ---- Replay / Double-Spending Prevention ----
    // Ensure this payment ID has not already been claimed by a different booking or order
    if (type === "workshop") {
      const existingPayment = await Registration.findOne({
        razorpayPaymentId: razorpay_payment_id,
        bookingId: { $ne: bookingId ? bookingId.toUpperCase() : "" },
      });
      if (existingPayment) {
        return next(ApiError.badRequest("This payment has already been credited to another booking."));
      }
    } else if (type === "product") {
      const existingPayment = await ProductOrder.findOne({
        razorpayPaymentId: razorpay_payment_id,
        orderId: { $ne: orderId || "" },
      });
      if (existingPayment) {
        return next(ApiError.badRequest("This payment has already been credited to another product order."));
      }
    }

    // 3. ---- Fetch order from Razorpay gateway to cross-verify amount & metadata ----
    let rzpOrder = null;
    try {
      rzpOrder = await razorpay.orders.fetch(razorpay_order_id);
    } catch (fetchErr) {
      console.warn("Could not fetch order from Razorpay for validation:", fetchErr.message);
    }

    // 4. ---- Valid payment — update records idempotently ----
    let updatedRecord = null;

    if (type === "workshop" && bookingId) {
      const reg = await Registration.findOne({ bookingId: bookingId.toUpperCase() });
      if (!reg) {
        return next(ApiError.notFound(`Registration record not found for booking: ${bookingId}`));
      }

      // Verify that paid amount strictly matches registration amount
      if (rzpOrder && typeof reg.amount === "number") {
        const expectedPaise = Math.round(reg.amount * 100);
        if (rzpOrder.amount !== expectedPaise) {
          return next(ApiError.badRequest("Paid amount does not match workshop registration amount."));
        }
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

    if (type === "product" && orderId) {
      const prodOrder = await ProductOrder.findOne({ orderId });
      if (!prodOrder) {
        return next(ApiError.notFound(`Product order not found: ${orderId}`));
      }

      // Verify that paid amount strictly matches product total amount
      if (rzpOrder && typeof prodOrder.totalAmount === "number") {
        const expectedPaise = Math.round(prodOrder.totalAmount * 100);
        if (rzpOrder.amount !== expectedPaise) {
          return next(ApiError.badRequest("Paid amount does not match product order total."));
        }
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
        razorpay_order_id,
        razorpay_payment_id,
        record: updatedRecord,
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
    const rawPayload = req.rawBody || JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawPayload)
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
    const notes = paymentEntity.notes || {};

    switch (event) {
      case "payment.captured": {
        // Idempotently update workshop registration if applicable
        if (notes.bookingId) {
          const reg = await Registration.findOne({ bookingId: notes.bookingId.toUpperCase() });
          if (reg && reg.paymentStatus !== "completed") {
            reg.paymentStatus = "completed";
            reg.paymentMethod = "razorpay";
            reg.razorpayOrderId = rzpOrderId;
            reg.razorpayPaymentId = rzpPaymentId;
            await reg.save();

            // Decrement workshop spot
            await Workshop.findOneAndUpdate(
              { slug: reg.workshopId, spotsLeft: { $gt: 0 } },
              { $inc: { spotsLeft: -1 } }
            );
          }
        }

        // Idempotently update product order if applicable
        if (notes.orderId) {
          const prodOrder = await ProductOrder.findOne({ orderId: notes.orderId });
          if (prodOrder && prodOrder.orderStatus !== "confirmed") {
            prodOrder.orderStatus = "confirmed";
            prodOrder.paymentMethod = "razorpay";
            prodOrder.razorpayOrderId = rzpOrderId;
            prodOrder.razorpayPaymentId = rzpPaymentId;
            await prodOrder.save();

            // Decrement inventory stock
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
        break;
      }

      case "payment.failed": {
        if (notes.bookingId) {
          await Registration.findOneAndUpdate(
            { bookingId: notes.bookingId.toUpperCase(), paymentStatus: { $ne: "completed" } },
            { paymentStatus: "failed" }
          );
        }
        if (notes.orderId) {
          await ProductOrder.findOneAndUpdate(
            { orderId: notes.orderId, orderStatus: { $ne: "confirmed" } },
            { orderStatus: "cancelled" }
          );
        }
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
