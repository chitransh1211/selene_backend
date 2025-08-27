import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // Each user should have only one cart
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
        isCombo: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  { timestamps: { createdAt: false, updatedAt: true } } // Only updatedAt
);

export const Cart = mongoose.model("Cart", cartSchema);
