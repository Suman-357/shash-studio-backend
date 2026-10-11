const Section = require("../models/Section");
const ApiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");

/**
 * @desc    Get all active sections
 * @route   GET /api/v1/sections
 * @access  Public
 */
const getSections = async (req, res, next) => {
  try {
    const sections = await Section.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
    return ApiResponse.success(res, sections, "Sections retrieved successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get section by slug or ID
 * @route   GET /api/v1/sections/:idOrSlug
 * @access  Public
 */
const getSectionBySlug = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    let section;
    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      section = await Section.findById(idOrSlug);
    } else {
      section = await Section.findOne({ slug: idOrSlug.toLowerCase() });
    }

    if (!section) {
      return next(ApiError.notFound(`Section "${idOrSlug}" not found`));
    }

    return ApiResponse.success(res, section, "Section details retrieved");
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new section (Admin privilege)
 * @route   POST /api/v1/sections
 * @access  Private (Admin)
 */
const createSection = async (req, res, next) => {
  try {
    const { slug, name, nameKn, icon, emoji, tagline, taglineKn, badge, badgeKn, accentColor, order } = req.body;

    if (!name || !nameKn) {
      return next(ApiError.badRequest("Section name in English and Kannada are required"));
    }

    const genSlug = slug ? slug.toLowerCase().trim() : name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");

    const existing = await Section.findOne({ slug: genSlug });
    if (existing) {
      return next(ApiError.badRequest(`A section with slug "${genSlug}" already exists`));
    }

    const section = await Section.create({
      slug: genSlug,
      name,
      nameKn,
      icon: icon || "spa",
      emoji: emoji || "✨",
      tagline: tagline || "",
      taglineKn: taglineKn || "",
      badge: badge || "",
      badgeKn: badgeKn || "",
      accentColor: accentColor || "#1C3325",
      order: Number(order) || 0,
      isActive: true
    });

    return ApiResponse.created(res, section, "New section created successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update section details
 * @route   PUT /api/v1/sections/:idOrSlug
 * @access  Private (Admin)
 */
const updateSection = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    let section;

    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      section = await Section.findByIdAndUpdate(idOrSlug, req.body, { new: true, runValidators: true });
    } else {
      section = await Section.findOneAndUpdate({ slug: idOrSlug.toLowerCase() }, req.body, { new: true, runValidators: true });
    }

    if (!section) {
      return next(ApiError.notFound(`Section "${idOrSlug}" not found`));
    }

    return ApiResponse.success(res, section, "Section updated successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete or deactivate section
 * @route   DELETE /api/v1/sections/:idOrSlug
 * @access  Private (Superadmin)
 */
const deleteSection = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    let section;

    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      section = await Section.findByIdAndUpdate(idOrSlug, { isActive: false }, { new: true });
    } else {
      section = await Section.findOneAndUpdate({ slug: idOrSlug.toLowerCase() }, { isActive: false }, { new: true });
    }

    if (!section) {
      return next(ApiError.notFound(`Section "${idOrSlug}" not found`));
    }

    return ApiResponse.success(res, null, `Section "${idOrSlug}" deactivated successfully`);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSections,
  getSectionBySlug,
  createSection,
  updateSection,
  deleteSection
};
