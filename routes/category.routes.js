import { addNewCategory, deleteCategory, getAllCategories,getCategoryById, updateCategory } from "../controllers/category.controller.js";
import {Router} from 'express'
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/add").post(addNewCategory);

router.route("/all").get( getAllCategories);

router.route("/:id").get(verifyJWT, getCategoryById);

router.route("/update/:id").put(verifyJWT, updateCategory);

router.route("/delete/:id").delete(verifyJWT, deleteCategory);

export default router;
