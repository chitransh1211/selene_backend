import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addProduct, listProducts, filterProducts, getFeaturedProducts,getProductsByCategoryId, searchProducts,getProductById, updateProduct, deleteProduct, updateIsGift, updateIsSubscribed, toggleProductStatus, getProductByIds } from "../controllers/product.controller.js";



const router = Router();

router.route("/add").post(addProduct);
router.route("/list").get(listProducts);
router.route("/filters").post(filterProducts);
router.route("/featured").get(getFeaturedProducts);
router.route("/:id").get(getProductById);
router.route("/getAll").post(getProductByIds);
router.route("/update/:id").put(verifyJWT, updateProduct);
router.route("/delete/:id").delete(verifyJWT, deleteProduct);
router.route("/status/:id").patch(verifyJWT, toggleProductStatus);
router.route("/:id/is-gift").patch(updateIsGift);
router.route("/search-products").post(searchProducts);
router.route("/category/products").post(getProductsByCategoryId);
router.route("/:id/is-subscribed").patch(updateIsSubscribed);

export default router;
