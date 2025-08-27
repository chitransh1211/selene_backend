import { Order } from "../models/order.schema.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Cart } from "../models/cart.schema.js";
import { Product } from "../models/product.model.js";
import crypto from "crypto";
import Razorpay from "razorpay";

// 1. Place a new order with giftCost calculation
console.log("key_id", process.env.KEY_ID);
console.log("key_secret", process.env.KEY_SECRET);

const razorpayInstance = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});

export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount, currency = "INR" } = req.body;
  if (!amount || amount <= 0) {
    throw new ApiError(400, "Invalid amount for Razorpay order");
  }
  const options = {
    amount: amount * 100, // amount in paise
    currency,
    receipt: `order_rcptid_${Date.now()}`,
  };
  const order = await razorpayInstance.orders.create(options);
  console.log(order)
  if (!order) {
    throw new ApiError(500, "Failed to create Razorpay order.");
  }

  res.status(201).json({ orderId: order.id, currency, amount: order.amount });
});
export const placeOrder = asyncHandler(async (req, res) => {
  const {
    userId,
    items,
    totalAmount,
    grandTotal,
    shippingAddress,
    paymentMethod,
    paymentStatus,
    orderNotes,
    isGift,
    isSubscribed,
    deliveryCharge,
    codCharge,
    giftCost,
    couponId,
    couponCode,
    couponDiscount,
    discountOnCombo,
    paymentData,
  } = req.body;

  if (!userId) {
    throw new ApiError(400, "Invalid user ID.");
  }

  if (!items || items.length === 0) {
    throw new ApiError(400, "No items provided for the order.");
  }

  // Validate payment method
  const validPaymentMethods = ["cod", "prepaid"];
  if (
    paymentMethod &&
    !validPaymentMethods.includes(paymentMethod.toLowerCase())
  ) {
    throw new ApiError(400, "Invalid payment method.");
  }

  // Compute default paymentStatus if not provided
  let finalPaymentStatus =
    paymentStatus ??
    (paymentMethod?.toLowerCase() === "cod" ? "paid" : "pending");

  // Prepare the base orderPayload
  const orderPayload = {
    userId,
    items: items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      isGift: !!item.isGift,
      isSubscribed: !!item.isSubscribed,
      isCombo: !!item.isCombo,
    })),
    totalAmount,
    grandTotal,
    paymentMethod,
    paymentStatus: finalPaymentStatus,
    shippingAddress,
    orderNotes,
    isGift: !!isGift,
    isSubscribed: !!isSubscribed,
    deliveryCharge: deliveryCharge ?? 0,
    codCharge: codCharge ?? 0,
    giftCost: giftCost ?? 0,
    couponId: couponId || null,
    couponCode: couponCode || null,
    couponDiscount: couponDiscount || 0,
    discountOnCombo: discountOnCombo || 0,
    deliveryStatus: "pending",
  };

  // If payment is prepaid, verify Razorpay signature
  if (paymentMethod?.toLowerCase() === "prepaid") {
    if (!paymentData) {
      throw new ApiError(400, "Missing payment data for prepaid payment.");
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.KEY_SECRET)
      .update(paymentData.razorpayOrderId + "|" + paymentData.razorpayPaymentId)
      .digest("hex");

    if (generatedSignature !== paymentData.razorpaySignature) {
      throw new ApiError(400, "Invalid Razorpay payment signature.");
    }

    // If signature verified, set paymentStatus paid and attach paymentData
    orderPayload.paymentStatus = "paid";
    orderPayload.paymentData = paymentData;
  }

  // If COD, paymentStatus remains as set (usually "paid" or "pending")

  // Create order in DB
  const order = await Order.create(orderPayload);

  // Return the created order wrapped in your ApiResponse format
  return res
    .status(201)
    .json(new ApiResponse(201, order, "Order placed successfully."));
});

// 2. Get orders of a specific user
export const getUserOrders = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const orders = await Order.find({ userId }).sort({ createdAt: -1 });

  res
    .status(200)
    .json(new ApiResponse(200, orders, "User orders fetched successfully."));
});

// 3. Get order by ID (can expand as needed)
export const getOrderById = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  if (!orderId) {
    throw new ApiError(400, "Invalid order ID");
  }

  const order = await Order.findById(orderId)
    .populate("userId")
    .populate("items")
    .populate("items.productId");

  if (!order) throw new ApiError(404, "Order not found");

  res
    .status(200)
    .json(new ApiResponse(200, order, "Order details fetched successfully."));
});

// 4. Get all orders (Admin)
export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().populate("userId").sort({ createdAt: -1 });

  res
    .status(200)
    .json(new ApiResponse(200, orders, "All orders fetched successfully."));
});

// 5. Update payment status (Admin or webhook)
export const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status, razorpayPaymentId } = req.body;

  if (!["pending", "paid", "failed"].includes(status)) {
    throw new ApiError(400, "Invalid payment status");
  }

  const updatePayload = {
    paymentStatus: status,
  };

  // Save razorpayPaymentId if provided when payment is successful
  if (status === "paid" && razorpayPaymentId) {
    updatePayload.razorpayPaymentId = razorpayPaymentId;
  }

  const order = await Order.findByIdAndUpdate(orderId, updatePayload, {
    new: true,
  });

  if (!order) throw new ApiError(404, "Order not found");

  res.status(200).json(new ApiResponse(200, order, "Payment status updated."));
});

// 6. Update delivery status (Admin)
export const updateDeliveryStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  if (!["pending", "shipped", "delivered", "cancelled"].includes(status)) {
    throw new ApiError(400, "Invalid delivery status");
  }

  const order = await Order.findByIdAndUpdate(
    orderId,
    { deliveryStatus: status },
    { new: true }
  );

  if (!order) throw new ApiError(404, "Order not found");

  res.status(200).json(new ApiResponse(200, order, "Delivery status updated."));
});

// 7. Cancel order (User/Admin)
export const cancelOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found");

  if (
    order.deliveryStatus === "shipped" ||
    order.deliveryStatus === "delivered"
  ) {
    throw new ApiError(
      400,
      "Cannot cancel an order that is already shipped or delivered."
    );
  }

  order.deliveryStatus = "cancelled";
  await order.save();

  res.status(200).json(new ApiResponse(200, order, "Order cancelled."));
});

// 8. Delete order (Admin)
export const deleteOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const deleted = await Order.findByIdAndDelete(orderId);
  if (!deleted) throw new ApiError(404, "Order not found");

  res
    .status(200)
    .json(new ApiResponse(200, deleted, "Order deleted successfully."));
});
