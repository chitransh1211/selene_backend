import mongoose from "mongoose";
const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        isGift: {
          type: Boolean,
          default: false,
        },
        isSubscribed: {
          type: Boolean,
          default: false,
        },
        isCombo: { type: Boolean, default: false },
      },
    ],
    totalAmount: { type: Number },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["prepaid", "COD"],
    },
    deliveryStatus: {
      type: String,
      enum: ["pending", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    shippingAddress: {
      name: String,
      street: String,
      city: String,
      state: String,
      country: String,
      pincode: String,
      phone: String,
    },
    orderNotes: { type: String },
    isFreeDelivery: { type: String },
    razorpayPaymentId: { type: String },
    isGift: { type: Boolean },
    isSubscribed: { type: Boolean },
    deliveryCharge: { type: Number, default: 30 },
    codCharge: { type: Number, default: 30 },
    giftCost: { type: Number },
    couponId: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon" },
    discountOnCombo: { type: Number, default: 10 },
    grandTotal: { type: Number },
    couponCode:{type:String},
    couponDiscount:{type:Number},
    paymentData:{
      type:Object,
      default:{}
    }
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
