import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addCoupon,
  updateCoupon,
  deleteCoupon,
  getAllCoupons,
  getCouponById,
  toggleCouponStatus
} from "../controllers/coupon.controller.js";

const router = Router();

// Create coupon
router.route("/add").post(verifyJWT, addCoupon);

// List all coupons
router.route("/list").get(getAllCoupons);

// Get single coupon by ID
router.route("/:id").get(getCouponById);

// Update coupon
router.route("/update/:id").put(verifyJWT, updateCoupon);

// Delete coupon
router.route("/delete/:id").delete(verifyJWT, deleteCoupon);

// Toggle active/inactive status
router.route("/status/:id").patch(verifyJWT, toggleCouponStatus);

export default router;
