const ApiError = require("../utils/apiError");

/**
 * Validate Registration Payload
 */
const validateRegistration = (req, res, next) => {
  const { fullName, whatsapp, email, workshopId, slot } = req.body;
  const errors = [];

  if (!fullName || typeof fullName !== "string" || fullName.trim().length < 2) {
    errors.push("Full name must be at least 2 characters long");
  }

  if (!whatsapp || !/^[0-9]{10,12}$/.test(String(whatsapp).replace(/[^0-9]/g, ""))) {
    errors.push("A valid 10 to 12 digit WhatsApp number is required");
  }

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    errors.push("A valid email address is required");
  }

  if (!workshopId) {
    errors.push("Workshop ID is required");
  }

  if (!slot) {
    errors.push("Batch timing slot is required");
  }

  if (errors.length > 0) {
    return next(ApiError.badRequest("Invalid registration input", errors));
  }

  // Sanitize
  req.body.fullName = fullName.trim();
  req.body.whatsapp = String(whatsapp).replace(/[^0-9]/g, "");
  req.body.email = email.trim().toLowerCase();

  next();
};

/**
 * Validate Inquiry Payload
 */
const validateInquiry = (req, res, next) => {
  const { name, whatsapp, message } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push("Name is required and must be at least 2 characters");
  }

  if (!whatsapp || !/^[0-9]{10,12}$/.test(String(whatsapp).replace(/[^0-9]/g, ""))) {
    errors.push("A valid WhatsApp number is required");
  }

  if (!message || message.trim().length < 5) {
    errors.push("Message must be at least 5 characters long");
  }

  if (errors.length > 0) {
    return next(ApiError.badRequest("Invalid inquiry input", errors));
  }

  req.body.name = name.trim();
  req.body.whatsapp = String(whatsapp).replace(/[^0-9]/g, "");
  req.body.message = message.trim();

  next();
};

module.exports = { validateRegistration, validateInquiry };
