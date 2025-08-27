import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

export const addProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    discount = 0,
    category,
    brand,
    images = [],
    stock = 0,
    sold = 0,
    isFeatured = false,
    isActive = true,
    metaTitle = "",
    metaDescription = "",
    benefits = "",
    ingredients = "",
    howToUse = "",
    manufacturingDetails = "",
    additionalInfo = [],
    reviewsSection = false,
    isGift = false,
    giftCost = 0,
    isSubscribed = false,
    tags = [],
    lowStockThreshhold = 0,
    lowStockAlert = false,
    thumbnails,
    videos,
    suggestedProducts = [], // <--- ADDED HERE
  } = req.body;

  if (!name || !price || !category) {
    throw new ApiError(400, "Name, price and category are required");
  }

  const finalPrice = price - (price * discount) / 100;

  // Ensure suggestedProducts is always an array of ObjectIds if provided
  const suggestedProductsArray = Array.isArray(suggestedProducts)
    ? suggestedProducts.map((id) => new mongoose.Types.ObjectId(id))
    : [];

  const product = await Product.create({
    name,
    description,
    price,
    discount,
    finalPrice,
    category,
    brand,
    images,
    stock,
    sold,
    isFeatured,
    isActive,
    metaTitle,
    metaDescription,
    benefits,
    ingredients,
    howToUse,
    manufacturingDetails,
    additionalInfo: [],
    reviewsSection,
    isGift,
    giftCost,
    isSubscribed,
    tags,
    lowStockThreshhold,
    lowStockAlert,
    thumbnails,
    videos,
    suggestedProducts: suggestedProductsArray, // <--- SET HERE
  });

  res
    .status(201)
    .json(new ApiResponse(201, product, "Product added successfully"));
});

// 2. Get paginated list of products
export const listProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.body.page) || 1;
  const limit = parseInt(req.body.limit) || 10;

  const skip = (page - 1) * limit;
  const total = await Product.countDocuments();

  const products = await Product.find()
    .populate("category")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        products,
        page,
        totalPages: Math.ceil(total / limit),
        total,
      },
      "Product list fetched successfully"
    )
  );
});
// Fetch products by category ID (paginated, POST body)
export const getProductsByCategoryId = asyncHandler(async (req, res) => {
  const { categoryId, page = 1, limit = 10 } = req.body;

  if (!categoryId) {
    throw new ApiError(400, "categoryId is required");
  }

  // Convert string to ObjectId if necessary
  let categoryObjectId;
  try {
    categoryObjectId = new mongoose.Types.ObjectId(categoryId);
  } catch (err) {
    throw new ApiError(400, "Invalid categoryId format");
  }

  const skip = (page - 1) * limit;
  const query = { category: categoryObjectId, isActive: true };

  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate("category")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  res.status(200).json(
    new ApiResponse(
      200,
      {
        products,
        page: Number(page),
        totalPages: Math.ceil(total / limit),
        total,
      },
      "Products by category fetched successfully"
    )
  );
});

// 3. Delete a product
export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Invalid product ID");
  }

  const deleted = await Product.findByIdAndDelete(id);
  if (!deleted) {
    throw new ApiError(404, "Product not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, deleted, "Product deleted successfully"));
});

// 4. Get products by filter with pagination
export const filterProducts = asyncHandler(async (req, res) => {
  const {
    category,
    brand,
    minPrice,
    maxPrice,
    isFeatured,
    search,
    page = 1,
    limit = 10,
  } = req.body;
  const skip = (page - 1) * limit;

  const matchStage = { isActive: true };
  console.log(search);

  if (category) matchStage.category = new mongoose.Types.ObjectId(category);
  if (brand) matchStage.brand = brand;
  if (isFeatured !== undefined) matchStage.isFeatured = isFeatured;

  if (minPrice !== undefined || maxPrice !== undefined) {
    matchStage.finalPrice = {};
    if (minPrice !== undefined) matchStage.finalPrice.$gte = Number(minPrice);
    if (maxPrice !== undefined) matchStage.finalPrice.$lte = Number(maxPrice);
  }

  if (search && typeof search === "string") {
    const searchRegex = new RegExp(search, "i");
    matchStage.$or = [
      { name: { $regex: searchRegex } },
      { description: { $regex: searchRegex } },
      { tags: { $elemMatch: { $regex: searchRegex } } },
    ];
  }

  const pipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "category",
      },
    },
    { $unwind: "$category" },
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        totalCount: [{ $count: "count" }],
        products: [{ $skip: skip }, { $limit: Number(limit) }],
      },
    },
    {
      $project: {
        products: 1,
        total: { $arrayElemAt: ["$totalCount.count", 0] },
      },
    },
  ];

  const result = await Product.aggregate(pipeline);

  const total = result[0]?.total || 0;
  const products = result?.products || [];

  res.status(200).json(
    new ApiResponse(
      200,
      {
        products,
        page: Number(page),
        totalPages: Math.ceil(total / limit),
        total,
      },
      "Filtered products fetched successfully"
    )
  );
});
// PATCH /product/:id/is-gift
export const updateIsGift = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { checked } = req.body;
  if (typeof checked !== "boolean") {
    return res.status(400).json({ message: "Checked must be a boolean." });
  }
  const product = await Product.findByIdAndUpdate(
    id,
    { isGift: checked },
    { new: true }
  );
  if (!product) {
    return res.status(404).json({ message: "Product not found." });
  }
  res.status(200).json({ success: true, product });
});
// PATCH /product/:id/is-subscribed
export const updateIsSubscribed = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { checked } = req.body;
  if (typeof checked !== "boolean") {
    return res.status(400).json({ message: "Checked must be a boolean." });
  }
  const product = await Product.findByIdAndUpdate(
    id,
    { isSubscribed: checked },
    { new: true }
  );
  if (!product) {
    return res.status(404).json({ message: "Product not found." });
  }
  res.status(200).json({ success: true, product });
});

// 5. Get product by ID
export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Invalid product ID");
  }

  const product = await Product.findById(id).populate("category");
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, product, "Product details fetched successfully")
    );
});

// 6. Update a product
export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { update } = req.body;

  if (!id) {
    throw new ApiError(400, "Invalid product ID");
  }

  if (update.price && update.discount !== undefined) {
    update.finalPrice = update.price - (update.price * update.discount) / 100;
  }

  const allowedFields = [
    "name",
    "description",
    "price",
    "discount",
    "finalPrice",
    "category",
    "brand",
    "images",
    "stock",
    "sold",
    "isFeatured",
    "isActive",
    "metaTitle",
    "metaDescription",
    "benefits",
    "ingredients",
    "howToUse",
    "manufacturingDetails",
    "additionalInfo",
    "reviewsSection",
    "isGift",
    "giftCost",
    "isSubscribed",
    "tags",
    "lowStockThreshhold",
    "lowStockAlert",
    "thumbnails",
    "videos",
    "suggestedProducts", // <-- ADDED HERE
  ];

  const filteredUpdate = {};
  for (const key of allowedFields) {
    if (update[key] !== undefined) {
      // For suggestedProducts, convert to ObjectId array
      if (key === "suggestedProducts" && Array.isArray(update[key])) {
        filteredUpdate[key] = update[key].map(
          (id) => new mongoose.Types.ObjectId(id)
        );
      } else {
        filteredUpdate[key] = update[key];
      }
    }
  }

  const product = await Product.findByIdAndUpdate(id, filteredUpdate, {
    new: true,
  });

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, product, "Product updated successfully"));
});
// Get multiple products by an array of IDs
export const getProductByIds = asyncHandler(async (req, res) => {
    console.log(req.body)
  const { ids } = req.body;
  

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw new ApiError(400, "Ids must be a non-empty array");
  }

  // Convert all ids to ObjectId
  const objectIds = ids.map((id) => id);

  const products = await Product.find({ _id: { $in: objectIds } })
    .populate("category")
    .sort({ createdAt: -1 });

  if (!products || products.length === 0) {
    throw new ApiError(404, "No products found for the given IDs");
  }

  res.status(200).json(
    new ApiResponse(
      200,
      products,
      "Products fetched successfully"
    )
  );
});


export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true, isActive: true })
    .populate("category")
    .limit(10)
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json(new ApiResponse(200, products, "Featured products fetched"));
});

export const toggleProductStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (!id) {
    throw new ApiError(400, "Invalid product ID");
  }

  const product = await Product.findByIdAndUpdate(
    id,
    { isActive },
    { new: true }
  );

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        product,
        `Product ${isActive ? "activated" : "deactivated"} successfully`
      )
    );
});
export const searchProducts = async (req, res) => {
  try {
    const { searchString } = req.body; // Expect search query in URL query param 'q'
    if ( typeof searchString !== "string") {
      return res.status(400).json({ message: "Invalid or missing search query" });
    }

    // Case-insensitive regex for partial match
    const searchRegex = new RegExp(searchString, "i");

    // Search condition: name OR description OR tags array contains match
    const products = await Product.find({
      $or: [
        { name: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
        { tags: { $regex: searchRegex } },
      ],
      isActive: true, // Optional: only active products
    }).exec();

    return res.status(200).json({ data: products });
  } catch (error) {
    console.error("Error searching products:", error);
    return res.status(500).json({ message: "Server error while searching products" });
  }
};