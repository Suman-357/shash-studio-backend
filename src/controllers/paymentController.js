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
 *  - notes       : optional object { customerName, ... }
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
    } = req.body;

    let amountInRupees = 0;
    let itemTitle = "";

    // ──── Resolve price from database ────
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

    const options = {
      amount: amountInPaise,
      currency,
      receipt: receipt || `rcpt_${type}_${Date.now()}`,
      notes: { ...notes, type, itemTitle },
    };

    const order = await razorpay.orders.create(options);

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

    // ---- Signature verification ----
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      // Signature mismatch — potential tamper
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

    // ---- Valid payment — update records ----
    let updatedRecord = null;

    if (type === "workshop" && bookingId) {
      const reg = await Registration.findOne({ bookingId: bookingId.toUpperCase() });
      if (!reg) {
        return next(ApiError.notFound(`Registration record not found for booking: ${bookingId}`));
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

      prodOrder.paymentMethod = "razorpay";
      prodOrder.orderStatus = "confirmed";
      prodOrder.razorpayOrderId = razorpay_order_id;
      prodOrder.razorpayPaymentId = razorpay_payment_id;
      prodOrder.razorpaySignature = razorpay_signature;
      updatedRecord = await prodOrder.save();
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

    // If a webhook secret is configured, verify the signature
    if (webhookSecret) {
      const receivedSignature = req.headers["x-razorpay-signature"];
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(JSON.stringify(req.body))
        .digest("hex");

      if (receivedSignature !== expectedSignature) {
        console.warn("Webhook signature mismatch — ignoring event.");
        return res.status(400).json({ success: false, message: "Invalid webhook signature" });
      }
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
        // Update workshop registration if applicable
        if (notes.bookingId) {
          await Registration.findOneAndUpdate(
            { bookingId: notes.bookingId.toUpperCase() },
            {
              paymentStatus: "completed",
              razorpayOrderId: rzpOrderId,
              razorpayPaymentId: rzpPaymentId,
            }
          );
        }
        // Update product order if applicable
        if (notes.orderId) {
          await ProductOrder.findOneAndUpdate(
            { orderId: notes.orderId },
            {
              orderStatus: "confirmed",
              razorpayOrderId: rzpOrderId,
              razorpayPaymentId: rzpPaymentId,
            }
          );
        }
        break;
      }

      case "payment.failed": {
        if (notes.bookingId) {
          await Registration.findOneAndUpdate(
            { bookingId: notes.bookingId.toUpperCase() },
            { paymentStatus: "failed" }
          );
        }
        if (notes.orderId) {
          await ProductOrder.findOneAndUpdate(
            { orderId: notes.orderId },
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
