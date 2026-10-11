const Razorpay = require("razorpay");
const env = require("./env");

/**
 * Razorpay SDK Instance
 * --------------------------------------------------
 * Reads RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET from
 * process.env (loaded via dotenv in env.js).
 *
 * In development mode a missing key triggers a warning
 * instead of a hard crash so the rest of the API still
 * boots for non-payment endpoints.
 * --------------------------------------------------
 */

if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
  const msg = "⚠️  RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing in .env";
  if (env.NODE_ENV === "production") {
    throw new Error(msg);
  }
  console.warn(msg, "— payment endpoints will fail until keys are supplied.");
}

const razorpayInstance = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

module.exports = razorpayInstance;
