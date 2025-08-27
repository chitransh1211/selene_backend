import { Coupon } from "../models/coupon.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * @desc Add new coupon
 * @route POST /api/coupons
 */
export const addCoupon = asyncHandler(async (req, res) => {
  const {
    code,
    discountType,
    discountValue,
    minimumAmount = 0,
    isActive = true,
    usageLimit = 1,
    user
  } = req.body;

  if (!code || !discountType || discountValue === undefined) {
    throw new ApiError(400, "Code, discount type, and discount value are required");
  }

  const exists = await Coupon.findOne({ code: code.trim().toUpperCase() });
  if (exists) {
    throw new ApiError(400, "Coupon code already exists");
  }

  const coupon = await Coupon.create({
    code: code.trim().toUpperCase(),
    discountType,
    discountValue,
    minimumAmount,
    isActive,
    usageLimit,
    user
  });

  res.status(201).json(new ApiResponse(201, coupon, "Coupon added successfully"));
});

/**
 * @desc Update existing coupon
 * @route PUT /api/coupons/:id
 */
export const updateCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateFields = req.body;

  const coupon = await Coupon.findByIdAndUpdate(id, updateFields, { new: true });

  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  res.status(200).json(new ApiResponse(200, coupon, "Coupon updated successfully"));
});

/**
 * @desc Delete coupon
 * @route DELETE /api/coupons/:id
 */
export const deleteCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const coupon = await Coupon.findByIdAndDelete(id);

  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  res.status(200).json(new ApiResponse(200, coupon, "Coupon deleted successfully"));
});

/**
 * @desc Get all coupons
 * @route GET /api/coupons
 */
export const getAllCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().populate("user", "name email");

  res.status(200).json(new ApiResponse(200, coupons, "Coupons fetched successfully"));
});

/**
 * @desc Get single coupon
 * @route GET /api/coupons/:id
 */
export const getCouponById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const coupon = await Coupon.findById(id).populate("user", "name email");

  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  res.status(200).json(new ApiResponse(200, coupon, "Coupon fetched successfully"));
});

/**
 * @desc Toggle coupon status
 * @route PATCH /api/coupons/:id/toggle
 */
export const toggleCouponStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  const coupon = await Coupon.findByIdAndUpdate(id, { isActive }, { new: true });

  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        coupon,
        `Coupon ${isActive ? "activated" : "deactivated"} successfully`
      )
    );
});
