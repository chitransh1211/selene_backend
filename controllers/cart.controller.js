
import { Cart } from "../models/cart.schema.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const createOrUpdateCart = asyncHandler(async (req, res) => {
  const { userId, items = [] } = req.body;
  console.log(items)
  if (!userId) {
    throw new ApiError(400, "Invalid user ID");
  }



  let cart = await Cart.findOne({ userId });
  for (const newItem of items) {
  const existingIndex = cart?.items.findIndex(
    (item) => item.productId.toString() === newItem.productId.toString()
  );

  if (existingIndex > -1) {
    // Compare full existing item and newItem properties
    const existingItem = cart?.items[existingIndex];

    const isExactDuplicate =
      existingItem.quantity === newItem.quantity &&
      existingItem.isGift === newItem.isGift &&
      existingItem.isSubscribed === newItem.isSubscribed &&
      existingItem.isCombo === newItem.isCombo;

    if (isExactDuplicate) {
      throw new ApiError(
        400,
        `Duplicate cart item detected for product ${newItem.productId}`
      );
    }

    // Otherwise update existing item properties
    existingItem.quantity = newItem.quantity;
    existingItem.isGift = newItem.isGift;
    existingItem.isSubscribed = newItem.isSubscribed;
    existingItem.isCombo = newItem.isCombo;
  } else {
    cart?.items.push(newItem);
  }
}

  if (!cart) {
  cart = await Cart.create({ userId, items });
} else {
  for (const newItem of items) {
    const existingIndex = cart?.items.findIndex(
      (item) =>
        item.productId.toString() === newItem.productId.toString()
    );
    if (existingIndex > -1) {
      cart.items[existingIndex].quantity = newItem.quantity;
      cart.items[existingIndex].isGift = newItem.isGift;
      cart.items[existingIndex].isSubscribed = newItem.isSubscribed;
      cart.items[existingIndex].isCombo = newItem.isCombo;
    } else {
      cart.items.push(newItem);
    }
  }
  await cart.save();
}


  // Now populate to get full product objects
  const populatedCart = await Cart.findOne({ userId }).populate("items.productId");

  return res
    .status(200)
    .json(new ApiResponse(200, populatedCart, "Cart updated successfully"));
});


// 2. Get Cart by User ID
export const getCartByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "Invalid user ID");
  }

  const cart = await Cart.findOne({ userId }).populate("items.productId");

  if (!cart) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "Cart is empty"));
  }

  return res.status(200).json(new ApiResponse(200, cart, "Cart fetched successfully"));
});

// 3. Remove an Item from Cart
export const removeItemFromCart = asyncHandler(async (req, res) => {
  const { userId, productId } = req.body;

  if (!userId || !productId) {
    throw new ApiError(400, "Invalid user ID or product ID");
  }

  const cart = await Cart.findOne({ userId });
  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  cart.items = cart.items.filter(item => item.productId.toString() !== productId);
  await cart.save();

  return res.status(200).json(new ApiResponse(200, cart, "Item removed from cart"));
});

// 4. Clear Cart
export const clearCart = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "Invalid user ID");
  }

  const cart = await Cart.findOne({ userId });
  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  cart.items = [];
  await cart.save();

  return res.status(200).json(new ApiResponse(200, cart, "Cart cleared"));
});

// 5. Delete Cart (optional - usually not exposed)
export const deleteCart = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "Invalid user ID");
  }

  const deleted = await Cart.findOneAndDelete({ userId });
  if (!deleted) {
    throw new ApiError(404, "Cart not found");
  }

  return res.status(200).json(new ApiResponse(200, deleted, "Cart deleted"));
});

// Toggle isGift status
export const toggleIsGift = asyncHandler(async (req, res) => {
  const { userId, productId, isGift } = req.body;

  if (!userId || !productId || typeof isGift !== "boolean") {
    throw new ApiError(400, "Invalid parameters");
  }

  const cart = await Cart.findOne({ userId });
  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  const item = cart.items.find(item => item.productId.toString() === productId);
  if (!item) {
    throw new ApiError(404, "Item not found in cart");
  }

  item.isGift = isGift;
  await cart.save();

  const updatedCart = await Cart.findOne({ userId }).populate("items.productId");
  return res.status(200).json(new ApiResponse(200, updatedCart, "isGift status updated successfully"));
});

// Toggle isSubscribed status
export const toggleIsSubscribed = asyncHandler(async (req, res) => {
  const { userId, productId, isSubscribed } = req.body;

  if (!userId || !productId || typeof isSubscribed !== "boolean") {
    throw new ApiError(400, "Invalid parameters");
  }

  const cart = await Cart.findOne({ userId });
  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  const item = cart.items.find(item => item.productId.toString() === productId);
  if (!item) {
    throw new ApiError(404, "Item not found in cart");
  }

  item.isSubscribed = isSubscribed;
  await cart.save();

  const updatedCart = await Cart.findOne({ userId }).populate("items.productId");
  return res.status(200).json(new ApiResponse(200, updatedCart, "isSubscribed status updated successfully"));
});
