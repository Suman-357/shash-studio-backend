const Workshop = require("../models/Workshop");
const ApiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");

/**
 * @desc    Get all active workshops
 * @route   GET /api/v1/workshops
 * @access  Public
 */
const getWorkshops = async (req, res, next) => {
  try {
    const { category, section } = req.query;
    const query = { isActive: true };

    if (section && section !== "all") {
      query.section = section;
    }

    if (category && category !== "all") {
      query.category = category;
    }

    const workshops = await Workshop.find(query).sort({ price: 1 });
    return ApiResponse.success(res, workshops, "Workshops fetched successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single workshop by slug or ID
 * @route   GET /api/v1/workshops/:idOrSlug
 * @access  Public
 */
const getWorkshopById = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    let workshop;

    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      workshop = await Workshop.findById(idOrSlug);
    } else {
      workshop = await Workshop.findOne({ slug: idOrSlug.toLowerCase() });
    }

    if (!workshop) {
      return next(ApiError.notFound(`Workshop not found with id or slug ${idOrSlug}`));
    }

    return ApiResponse.success(res, workshop, "Workshop details retrieved");
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new workshop (Admin only)
 * @route   POST /api/v1/workshops
 * @access  Private (Admin)
 */
const createWorkshop = async (req, res, next) => {
  try {
    const workshop = await Workshop.create(req.body);
    return ApiResponse.created(res, workshop, "Workshop created successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update workshop (Admin only)
 * @route   PUT /api/v1/workshops/:id
 * @access  Private (Admin)
 */
const updateWorkshop = async (req, res, next) => {
  try {
    const workshop = await Workshop.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!workshop) {
      return next(ApiError.notFound(`Workshop not found with id ${req.params.id}`));
    }

    return ApiResponse.success(res, workshop, "Workshop updated successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete workshop (Admin only)
 * @route   DELETE /api/v1/workshops/:id
 * @access  Private (Superadmin)
 */
const deleteWorkshop = async (req, res, next) => {
  try {
    const workshop = await Workshop.findByIdAndDelete(req.params.id);

    if (!workshop) {
      return next(ApiError.notFound(`Workshop not found with id ${req.params.id}`));
    }

    return ApiResponse.success(res, null, "Workshop deleted successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWorkshops,
  getWorkshopById,
  createWorkshop,
  updateWorkshop,
  deleteWorkshop,
};
