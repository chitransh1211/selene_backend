
import { Review } from "../models/review.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// 1. Add or Update Review
export const addOrUpdateReview = asyncHandler(async (req, res) => {
  const { userId, productId, rating, comment } = req.body;

  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid user or product ID");
  }

  if (!rating || rating < 1 || rating > 5) {
    throw new ApiError(400, "Rating must be between 1 and 5");
  }

  let review = await Review.findOne({ userId, productId });

  if (review) {
    // Update existing review
    review.rating = rating;
    review.comment = comment;
    await review.save();

    return res
      .status(200)
      .json(new ApiResponse(200, review, "Review updated successfully"));
  }

  // Create new review
  review = await Review.create({ userId, productId, rating, comment });

  return res
    .status(201)
    .json(new ApiResponse(201, review, "Review submitted successfully"));
});

// 2. Get all reviews for a product
export const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product ID");
  }

  const reviews = await Review.find({ productId })
    .populate("userId", "name")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, reviews, "Product reviews fetched"));
});

// 3. Delete a review (admin or user)
export const deleteReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    throw new ApiError(400, "Invalid review ID");
  }

  const deleted = await Review.findByIdAndDelete(reviewId);

  if (!deleted) {
    throw new ApiError(404, "Review not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deleted, "Review deleted successfully"));
});

// 4. Get all reviews (admin)
export const getAllReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find()
    .populate("userId", "name")
    .populate("productId", "name");

  return res
    .status(200)
    .json(new ApiResponse(200, reviews, "All reviews fetched"));
});

// 5. Get review summary (avg rating & count for a product)
export const getProductReviewSummary = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product ID");
  }

  const result = await Review.aggregate([
    { $match: { productId: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: "$productId",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  const summary = result[0] || { averageRating: 0, totalReviews: 0 };

  return res
    .status(200)
    .json(new ApiResponse(200, summary, "Review summary fetched"));
});
