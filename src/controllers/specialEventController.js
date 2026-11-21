const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const env = require("../config/env");
const SpecialEvent = require("../models/SpecialEvent");
const Registration = require("../models/Registration");
const ApiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");

/**
 * Check whether the incoming request carries a valid Admin JWT
 */
const isAdminRequest = (req) => {
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    try {
      jwt.verify(req.headers.authorization.split(" ")[1], env.JWT_SECRET);
      return true;
    } catch (_err) {
      return false;
    }
  }
  return false;
};

const DEFAULT_ALT_ACCESS_OPTIONS = [
  {
    platform: "youtube",
    label: "YouTube Membership",
    price: 179,
    url: "https://www.youtube.com/@sushiidays",
    note: "Join via @sushiidays YouTube Channel Membership"
  },
  {
    platform: "instagram",
    label: "Instagram Subscribers",
    price: 45,
    url: "https://www.instagram.com/sushiidays/",
    note: "Join via @sushiidays Instagram Subscription"
  }
];

/**
 * Seed default flagship Special Event if the collection is completely empty,
 * and upgrade initial placeholder pricing if untouched.
 */
const ensureDefaultSpecialEvent = async () => {
  const count = await SpecialEvent.countDocuments();
  if (count === 0) {
    await SpecialEvent.create({
      slug: "21-days-yoga-challenge-nov-30",
      title: "21 Days Yoga Challenge",
      titleKn: "21 ದಿನಗಳ ಯೋಗ ಚಾಲೆಂಜ್",
      badge: "SPECIAL BATCH · 30TH NOVEMBER",
      badgeKn: "ವಿಶೇಷ ಬ್ಯಾಚ್ · ನವೆಂಬರ್ 30",
      eventDateLabel: "30th November",
      startDate: new Date("2026-11-30T00:30:00.000Z"),
      endDate: new Date("2026-12-20T01:30:00.000Z"),
      duration: "21 Days · 60 Mins Daily",
      ageLimit: "14 years & above",
      accessLabel: "Zoom Live",
      altAccessOptions: DEFAULT_ALT_ACCESS_OPTIONS,
      timingSlot: "6:00 AM – 7:00 AM IST",
      slots: ["6:00 AM – 7:00 AM IST", "7:15 AM – 8:15 AM IST", "6:30 PM – 7:30 PM IST"],
      price: 699,
      originalPrice: 999,
      capacity: 50,
      enrolledCount: 0,
      description:
        "Transform your daily routine with our flagship 21 Days Yoga Challenge starting 30th November. Build strength, flexibility, mindful breathing, and lasting consistency live on Zoom with Sushii in Kannada & English.",
      descriptionKn:
        "ನವೆಂಬರ್ 30 ರಿಂದ ಆರಂಭವಾಗುವ ನಮ್ಮ ವಿಶೇಷ 21 ದಿನಗಳ ಯೋಗ ಚಾಲೆಂಜ್ ಮೂಲಕ ನಿಮ್ಮ ದೈನಂದಿನ ಆರೋಗ್ಯವನ್ನು ರೂಪಿಸಿಕೊಳ್ಳಿ. ಕನ್ನಡ ಮತ್ತು ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಜೂಮ್ ಮೂಲಕ ನೇರ ತರಗತಿಗಳು.",
      highlights: [
        "21 Days Interactive Zoom Live Sessions with Sushii",
        "Age Limit: 14 Years & Above",
        "Bilingual Instruction in Kannada & English",
        "24-Hour Class Replays & WhatsApp Community"
      ],
      instructorName: "Sushii",
      image: "challenge-21",
      zoomLink: "",
      status: "open",
      isFeatured: true,
      isActive: true
    });
    return;
  }

  // One-time upgrade for the untouched initial seed record (499 -> 699 Zoom Live + 14+ age limit + YT/IG tiers)
  await SpecialEvent.updateOne(
    {
      slug: "21-days-yoga-challenge-nov-30",
      price: 499,
      $or: [{ ageLimit: { $exists: false } }, { ageLimit: "" }]
    },
    {
      $set: {
        price: 699,
        ageLimit: "14 years & above",
        accessLabel: "Zoom Live",
        altAccessOptions: DEFAULT_ALT_ACCESS_OPTIONS,
        highlights: [
          "21 Days Interactive Zoom Live Sessions with Sushii",
          "Age Limit: 14 Years & Above",
          "Bilingual Instruction in Kannada & English",
          "24-Hour Class Replays & WhatsApp Community"
        ]
      }
    }
  );
};

/**
 * Helper to generate URL-friendly unique slug
 */
const generateSlug = (title, dateLabel = "") => {
  const base = `${title} ${dateLabel}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || `special-event-${Date.now()}`;
};

/**
 * @desc    Get all special events (Public: active open/upcoming; Admin: all with zoomLink & stats)
 * @route   GET /api/v1/special-events
 * @access  Public / Optional Admin
 */
const getSpecialEvents = async (req, res, next) => {
  try {
    await ensureDefaultSpecialEvent();

    const admin = isAdminRequest(req);
    const { includeInactive, status } = req.query;

    const query = {};
    if (!admin || includeInactive !== "true") {
      if (!admin) {
        query.isActive = true;
        query.status = { $in: ["upcoming", "open", "full"] };
      }
    }
    if (status && status !== "all") {
      query.status = status;
    }

    const events = await SpecialEvent.find(query).sort({ isFeatured: -1, startDate: 1, createdAt: -1 });

    // Compute real-time paid enrollments for each event
    const enhancedEvents = await Promise.all(
      events.map(async (ev) => {
        const paidCount = await Registration.countDocuments({
          specialEventId: ev._id,
          paymentStatus: "completed"
        });
        const evObj = ev.toObject();
        if (!admin) {
          delete evObj.zoomLink;
        }
        evObj.enrolledCount = paidCount;
        evObj.spotsAvailable = Math.max(0, (ev.capacity || 50) - paidCount);
        evObj.isFull = evObj.spotsAvailable <= 0 || ev.status === "full";
        if (!Array.isArray(evObj.slots) || evObj.slots.length === 0) {
          evObj.slots = evObj.timingSlot ? [evObj.timingSlot] : [];
        }
        return evObj;
      })
    );

    return ApiResponse.success(res, enhancedEvents, "Special events retrieved successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single special event by ID or slug (Admin also gets enrolled student roster)
 * @route   GET /api/v1/special-events/:idOrSlug
 * @access  Public / Optional Admin
 */
const getSpecialEventById = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const admin = isAdminRequest(req);

    const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);
    const event = await SpecialEvent.findOne(
      isObjectId ? { _id: idOrSlug } : { slug: idOrSlug.toLowerCase().trim() }
    );

    if (!event || (!admin && !event.isActive)) {
      return next(ApiError.notFound(`Special event "${idOrSlug}" not found`));
    }

    const paidRegistrations = await Registration.find({
      specialEventId: event._id,
      paymentStatus: "completed"
    }).sort({ createdAt: -1 });

    const evObj = event.toObject();
    evObj.enrolledCount = paidRegistrations.length;
    evObj.spotsAvailable = Math.max(0, (event.capacity || 50) - paidRegistrations.length);
    evObj.isFull = evObj.spotsAvailable <= 0 || event.status === "full";
    if (!Array.isArray(evObj.slots) || evObj.slots.length === 0) {
      evObj.slots = evObj.timingSlot ? [evObj.timingSlot] : [];
    }

    if (admin) {
      evObj.students = paidRegistrations;
    } else {
      delete evObj.zoomLink;
    }

    return ApiResponse.success(res, evObj, "Special event details retrieved");
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new special event / special batch
 * @route   POST /api/v1/special-events
 * @access  Private (Admin)
 */
const createSpecialEvent = async (req, res, next) => {
  try {
    const {
      slug,
      title,
      titleKn,
      badge,
      badgeKn,
      eventDateLabel,
      startDate,
      endDate,
      duration,
      ageLimit,
      accessLabel,
      altAccessOptions,
      timingSlot,
      slots,
      price,
      originalPrice,
      capacity,
      description,
      descriptionKn,
      highlights,
      instructorName,
      image,
      zoomLink,
      status,
      isFeatured,
      isActive
    } = req.body;

    if (!title || !eventDateLabel || !timingSlot || !description) {
      return next(
        ApiError.badRequest("Title, event date label, timing slot, and description are required.")
      );
    }

    const parsedPrice = Number(price);
    if (!Number.isFinite(parsedPrice) || parsedPrice < 1) {
      return next(ApiError.badRequest("Registration amount must be a valid number greater than ₹0."));
    }

    let resolvedSlug = slug
      ? String(slug).toLowerCase().trim()
      : generateSlug(title, eventDateLabel);

    const existing = await SpecialEvent.findOne({ slug: resolvedSlug });
    if (existing) {
      resolvedSlug = `${resolvedSlug}-${Date.now().toString().slice(-4)}`;
    }

    const normalizedSlots = Array.isArray(slots)
      ? slots.map((s) => String(s).trim()).filter(Boolean)
      : typeof slots === "string"
        ? slots.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

    if (normalizedSlots.length === 0 && timingSlot) {
      normalizedSlots.push(String(timingSlot).trim());
    }

    const normalizedHighlights = Array.isArray(highlights)
      ? highlights.map((h) => String(h).trim()).filter(Boolean)
      : typeof highlights === "string"
        ? highlights.split("\n").map((h) => h.trim()).filter(Boolean)
        : [];

    const parsedStartDate = startDate ? new Date(startDate) : new Date();
    const parsedEndDate = endDate
      ? new Date(endDate)
      : new Date(parsedStartDate.getTime() + 21 * 24 * 60 * 60 * 1000);

    const event = await SpecialEvent.create({
      slug: resolvedSlug,
      title: String(title).trim(),
      titleKn: titleKn ? String(titleKn).trim() : String(title).trim(),
      badge: badge ? String(badge).trim() : `SPECIAL EVENT · ${String(eventDateLabel).toUpperCase()}`,
      badgeKn: badgeKn ? String(badgeKn).trim() : "ವಿಶೇಷ ಬ್ಯಾಚ್ · ಸೀಮಿತ ಸೀಟುಗಳು",
      eventDateLabel: String(eventDateLabel).trim(),
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      duration: duration ? String(duration).trim() : "21 Days · 60 Mins Daily",
      ageLimit: ageLimit ? String(ageLimit).trim() : "",
      accessLabel: accessLabel ? String(accessLabel).trim() : "Zoom Live",
      altAccessOptions: Array.isArray(altAccessOptions)
        ? altAccessOptions
            .filter((o) => o && o.label && Number(o.price) > 0)
            .map((o) => ({
              platform: String(o.platform || "other").toLowerCase().trim(),
              label: String(o.label).trim(),
              price: Number(o.price),
              url: o.url ? String(o.url).trim() : "",
              note: o.note ? String(o.note).trim() : ""
            }))
        : [],
      timingSlot: normalizedSlots[0] || String(timingSlot).trim(),
      slots: normalizedSlots,
      price: parsedPrice,
      originalPrice: Number(originalPrice) || 0,
      capacity: Math.max(1, Number(capacity) || 50),
      description: String(description).trim(),
      descriptionKn: descriptionKn ? String(descriptionKn).trim() : String(description).trim(),
      highlights: normalizedHighlights,
      instructorName: instructorName ? String(instructorName).trim() : "Sushii",
      image: image ? String(image).trim() : "challenge-21",
      zoomLink: zoomLink ? String(zoomLink).trim() : "",
      status: status || "open",
      isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : true,
      isActive: isActive !== undefined ? Boolean(isActive) : true
    });

    return ApiResponse.created(res, event, "Special event created successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a special event
 * @route   PUT /api/v1/special-events/:id
 * @access  Private (Admin)
 */
const updateSpecialEvent = async (req, res, next) => {
  try {
    const event = await SpecialEvent.findById(req.params.id);
    if (!event) {
      return next(ApiError.notFound("Special event not found"));
    }

    const allowedFields = [
      "title",
      "titleKn",
      "badge",
      "badgeKn",
      "eventDateLabel",
      "startDate",
      "endDate",
      "duration",
      "ageLimit",
      "accessLabel",
      "timingSlot",
      "price",
      "originalPrice",
      "capacity",
      "description",
      "descriptionKn",
      "instructorName",
      "image",
      "zoomLink",
      "status",
      "isFeatured",
      "isActive"
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === "price") {
          const parsedPrice = Number(req.body.price);
          if (!Number.isFinite(parsedPrice) || parsedPrice < 1) {
            return next(ApiError.badRequest("Registration amount must be at least ₹1."));
          }
          event.price = parsedPrice;
        } else if (field === "originalPrice") {
          event.originalPrice = Math.max(0, Number(req.body.originalPrice) || 0);
        } else if (field === "capacity") {
          event.capacity = Math.max(1, Number(req.body.capacity) || 50);
        } else {
          event[field] = req.body[field];
        }
      }
    }

    if (req.body.slots !== undefined) {
      const normalizedSlots = Array.isArray(req.body.slots)
        ? req.body.slots.map((s) => String(s).trim()).filter(Boolean)
        : typeof req.body.slots === "string"
          ? req.body.slots.split(",").map((s) => s.trim()).filter(Boolean)
          : [];
      event.slots = normalizedSlots.length > 0 ? normalizedSlots : [event.timingSlot];
      if (normalizedSlots.length > 0 && !req.body.timingSlot) {
        event.timingSlot = normalizedSlots[0];
      }
    }

    if (req.body.altAccessOptions !== undefined) {
      event.altAccessOptions = Array.isArray(req.body.altAccessOptions)
        ? req.body.altAccessOptions
            .filter((o) => o && o.label && Number(o.price) > 0)
            .map((o) => ({
              platform: String(o.platform || "other").toLowerCase().trim(),
              label: String(o.label).trim(),
              price: Number(o.price),
              url: o.url ? String(o.url).trim() : "",
              note: o.note ? String(o.note).trim() : ""
            }))
        : [];
    }

    if (req.body.highlights !== undefined) {
      event.highlights = Array.isArray(req.body.highlights)
        ? req.body.highlights.map((h) => String(h).trim()).filter(Boolean)
        : typeof req.body.highlights === "string"
          ? req.body.highlights.split("\n").map((h) => h.trim()).filter(Boolean)
          : [];
    }

    await event.save();

    return ApiResponse.success(res, event, "Special event updated successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete or soft-cancel a special event
 * @route   DELETE /api/v1/special-events/:id
 * @access  Private (Admin)
 */
const deleteSpecialEvent = async (req, res, next) => {
  try {
    const event = await SpecialEvent.findById(req.params.id);
    if (!event) {
      return next(ApiError.notFound("Special event not found"));
    }

    const regCount = await Registration.countDocuments({
      specialEventId: event._id,
      paymentStatus: "completed"
    });

    if (regCount > 0) {
      event.isActive = false;
      event.status = "cancelled";
      await event.save();
      return ApiResponse.success(
        res,
        event,
        `Special event deactivated because ${regCount} paid participant(s) are registered.`
      );
    }

    await SpecialEvent.findByIdAndDelete(req.params.id);
    return ApiResponse.success(res, null, "Special event deleted successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Register a participant for a Special Event (creates pending registration before Razorpay payment)
 * @route   POST /api/v1/special-events/:idOrSlug/register
 * @access  Public
 */
const registerForSpecialEvent = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const {
      fullName,
      whatsapp,
      email,
      slot,
      languagePref,
      healthNotes,
      consentGiven
    } = req.body;

    if (!consentGiven) {
      return next(
        ApiError.badRequest("You must agree to the studio terms and consent to communications to proceed.")
      );
    }

    if (!fullName || typeof fullName !== "string" || fullName.trim().length < 2) {
      return next(ApiError.badRequest("Full name must be at least 2 characters long."));
    }

    const sanitizedPhone = String(whatsapp || "").replace(/[^0-9]/g, "");
    if (!/^[0-9]{10,12}$/.test(sanitizedPhone)) {
      return next(ApiError.badRequest("A valid 10 to 12 digit WhatsApp number is required."));
    }

    const normalizedEmail = email ? String(email).trim().toLowerCase() : "";
    if (normalizedEmail && !/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      return next(ApiError.badRequest("Please enter a valid email address."));
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);
    const event = await SpecialEvent.findOne(
      isObjectId ? { _id: idOrSlug } : { slug: String(idOrSlug).toLowerCase().trim() }
    );

    if (!event || !event.isActive || event.status === "cancelled" || event.status === "completed") {
      return next(ApiError.notFound("This special event is no longer open for registration."));
    }

    const paidCount = await Registration.countDocuments({
      specialEventId: event._id,
      paymentStatus: "completed"
    });

    if (event.status === "full" || paidCount >= (event.capacity || 50)) {
      return next(
        ApiError.badRequest("All seats for this special batch are currently booked. Please reach out on WhatsApp.")
      );
    }

    if (typeof event.price !== "number" || event.price <= 0) {
      return next(ApiError.badRequest("This event does not have an online registration fee configured."));
    }

    const availableSlots =
      Array.isArray(event.slots) && event.slots.length > 0 ? event.slots : [event.timingSlot];
    const resolvedSlot =
      slot && availableSlots.includes(String(slot).trim())
        ? String(slot).trim()
        : availableSlots[0] || event.timingSlot;

    const clientIp =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      req.ip ||
      "";

    const displayTitle = event.eventDateLabel
      ? `${event.title} · ${event.eventDateLabel}`
      : event.title;

    const registration = await Registration.create({
      fullName: fullName.trim(),
      whatsapp: sanitizedPhone,
      email: normalizedEmail,
      workshopId: event.slug,
      workshopTitle: displayTitle,
      registrationType: "special_event",
      specialEventId: event._id,
      slot: resolvedSlot,
      originalSlotSnapshot: {
        slotTime: resolvedSlot,
        batchTitle: displayTitle,
        bookedAt: new Date()
      },
      amount: event.price,
      languagePref: languagePref || "both",
      healthNotes: healthNotes || "beginner",
      paymentMethod: "razorpay",
      upiReference: "",
      paymentStatus: "pending",
      consentGiven: true,
      consentTimestamp: new Date(),
      consentIp: clientIp
    });

    return ApiResponse.created(
      res,
      {
        bookingId: registration.bookingId,
        fullName: registration.fullName,
        workshopTitle: registration.workshopTitle,
        specialEventId: event._id,
        eventDateLabel: event.eventDateLabel,
        slot: registration.slot,
        amount: registration.amount,
        whatsapp: registration.whatsapp,
        email: registration.email,
        paymentStatus: registration.paymentStatus,
        createdAt: registration.createdAt
      },
      "Special event registration initiated! Proceeding to secure payment."
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSpecialEvents,
  getSpecialEventById,
  createSpecialEvent,
  updateSpecialEvent,
  deleteSpecialEvent,
  registerForSpecialEvent
};

