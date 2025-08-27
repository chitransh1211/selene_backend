import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createOrUpdateCart,
  getCartByUserId,
  removeItemFromCart,
  clearCart,
  deleteCart,
  toggleIsGift,
  toggleIsSubscribed,
} from "../controllers/cart.controller.js";
const router = Router();

router.route("/create-or-update").post(verifyJWT, createOrUpdateCart);

router.route("/:userId").get(verifyJWT, getCartByUserId);

router.route("/remove-item").patch(verifyJWT, removeItemFromCart);

router.route("/clear/:userId").patch(verifyJWT, clearCart);

router.route("/delete/:userId").delete(verifyJWT, deleteCart);
router.route("/toggle-gift").patch(toggleIsGift);
router.route("/toggle-subscribed").patch(toggleIsSubscribed);

export default router;
