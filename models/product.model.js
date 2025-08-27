import { mongoose, Schema } from "mongoose";
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
    },
    finalPrice: {
      type: Number,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    brand: {
      type: String,
    },
    images: [{ type: String }],
    stock: { type: Number },
    sold: { type: Number },
    isFeatured: { type: Boolean },
    isActive: { type: Boolean },
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    benefits: { type: String, default: "" },
    ingredients: { type: String, default: "" },
    howToUse: { type: String, default: "" },
    manufacturingDetails: { type: String, default: "" },
    additionalInfo: [{
      title: { type: String },
      description: { type: String },
  }],
    reviewsSection: {
      type: Boolean,
    },
    isGift: {
      type: Boolean,
    },
    giftCost: {
      type: Number,
    },
    isSubscribed: {
      type: Boolean,
    },
    tags: [{ type: String }],
    lowStockThreshhold: { type: Number },
    lowStockAlert: { type: Boolean },
    thumbnails:[{type:String}],
    videos:[{type:String}],
    suggestedProducts:[{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    }]
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);
