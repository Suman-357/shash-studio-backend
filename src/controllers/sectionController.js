const Section = require("../models/Section");
const ApiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");

// Seed default sections if collection is empty
const seedDefaultSections = async () => {
  const count = await Section.countDocuments();
  if (count === 0) {
    await Section.insertMany([
      {
        slug: "yoga",
        name: "Yoga & Movement",
        nameKn: "ಯೋಗ ಮತ್ತು ಚಲನೆ",
        icon: "self_improvement",
        emoji: "🧘‍♀️",
        tagline: "Authentic Mysuru Vinyasa, Hatha Yoga, Strength Training & Daily Sadhana",
        taglineKn: "ಸಾಂಪ್ರದಾಯಿಕ ಮೈಸೂರು ಶೈಲಿಯ ಹಠ ಯೋಗ, ವಿನ್ಯಾಸ ಮತ್ತು ಶಕ್ತಿ ತರಬೇತಿ",
        badge: "Mysuru Shala Lineage",
        badgeKn: "ಮೈಸೂರು ಶಾಲಾ ಪರಂಪರೆ",
        accentColor: "#1C3325",
        lightBg: "bg-[#F4F8F5]",
        borderCol: "border-[#1C3325]/15",
        order: 1,
        isActive: true
      },
      {
        slug: "music",
        name: "Music & Sound",
        nameKn: "ಸಂಗೀತ ಮತ್ತು ನಾದ ಧ್ಯಾನ",
        icon: "music_note",
        emoji: "🎵",
        tagline: "Carnatic classical, Devara Nama, acoustic flute resonance, and Sushii Nights",
        taglineKn: "ಕರ್ನಾಟಕ ಶಾಸ್ತ್ರೀಯ ಸಂಗೀತ, ದೇವರನಾಮ, ಬಿದಿರಿನ ಕೊಳಲು ಮತ್ತು ನಿದ್ರಾ ಧ್ಯಾನ",
        badge: "Acoustic Healing",
        badgeKn: "ನಾದ ಚಿಕಿತ್ಸೆ",
        accentColor: "#2F3E46",
        lightBg: "bg-[#F3F6F8]",
        borderCol: "border-[#2F3E46]/15",
        order: 2,
        isActive: true
      },
      {
        slug: "other",
        name: "Wellness & Retreats",
        nameKn: "ಇತರ ಕ್ಷೇಮ & ತರಬೇತಿ",
        icon: "forest",
        emoji: "🍃",
        tagline: "Postpartum Maathru Samskaara, Fit & Flow, Chamundi walks, and retreats",
        taglineKn: "ಮಾತೃ ಸಂಸ್ಕಾರ, ಫಿಟ್ & ಫ್ಲೋ, ಚಾಮುಂಡಿ ಬೆಟ್ಟದ ನಡಿಗೆ ಮತ್ತು ವಿಶೇಷ ತರಬೇತಿ",
        badge: "Holistic Lifestyle",
        badgeKn: "ಸಮಗ್ರ ಜೀವನಶೈಲಿ",
        accentColor: "#C26D38",
        lightBg: "bg-[#FDF6F0]",
        borderCol: "border-[#C26D38]/15",
        order: 3,
        isActive: true
      }
    ]);
    console.log("🌿 Initial Default Sections seeded into MongoDB");
  }
};

/**
 * @desc    Get all active sections
 * @route   GET /api/v1/sections
 * @access  Public
 */
const getSections = async (req, res, next) => {
  try {
    await seedDefaultSections();
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
