import { Router } from "express";
import { placeOrder, getUserOrders, getAllOrders, updatePaymentStatus, updateDeliveryStatus, cancelOrder, deleteOrder, getOrderById, createRazorpayOrder } from "../controllers/order.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/place").post(placeOrder);
router.route("/user/:userId").get(verifyJWT, getUserOrders);
router.route("/:orderId").get(verifyJWT, getOrderById);
router.route("/get/all").get(verifyJWT, getAllOrders); // Admin access assumed
router.route("/payment-status/:orderId").patch(verifyJWT, updatePaymentStatus);
router.route("/delivery-status/:orderId").patch(verifyJWT, updateDeliveryStatus);
router.route("/cancel/:orderId").patch(verifyJWT, cancelOrder);
router.route("/delete/:orderId").delete(verifyJWT, deleteOrder);
router.route("/create-razorpay-order").post(verifyJWT, createRazorpayOrder);
export default router;
