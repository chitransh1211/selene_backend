import { Category } from "../models/category.schema.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const addNewCategory = asyncHandler(async (req, res) => {
  const { name, description, image } = req.body;

  if (!name || name.trim() === "") {
    throw new ApiError(400, "Category name is required");
  }

  const existing = await Category.findOne({ name: name.trim() });
  if (existing) {
    throw new ApiError(409, "Category with this name already exists");
  }

  const category = await Category.create({
    name: name.trim(),
    description,
    image,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, category, "Category created successfully"));
});

// @desc    Delete a category by ID
export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid category ID");
  }

  const deleted = await Category.findByIdAndDelete(id);
  if (!deleted) {
    throw new ApiError(404, "Category not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deleted, "Category deleted successfully"));
});

// @desc    Update category by ID
export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, image } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid category ID");
  }

  const category = await Category.findById(id);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  if (name) {
    const nameExists = await Category.findOne({ name: name.trim(), _id: { $ne: id } });
    if (nameExists) {
      throw new ApiError(409, "Another category with this name already exists");
    }
    category.name = name.trim();
  }

  if (description !== undefined) category.description = description;
  if (image !== undefined) category.image = image;

  await category.save();

  return res
    .status(200)
    .json(new ApiResponse(200, category, "Category updated successfully"));
});

// @desc    Get all categories
export const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, categories, "All categories retrieved successfully"));
});

// @desc    Get category by ID
export const getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid category ID");
  }

  const category = await Category.findById(id);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, category, "Category retrieved successfully"));
});