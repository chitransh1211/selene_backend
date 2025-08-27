import { addOrUpdateReview, getProductReviewSummary, getProductReviews, deleteReview, getAllReviews } from "../controllers/review.controller.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/add").post(verifyJWT, addOrUpdateReview); // Add or update
router.route("/product/:productId").get(getProductReviews); // Public
router.route("/summary/:productId").get(getProductReviewSummary); // Public
router.route("/delete/:reviewId").delete(verifyJWT, deleteReview); // Admin/User
router.route("/all").get(verifyJWT, getAllReviews); // Admin

export default router;
