// routes/user.routes.js
import { Router } from "express";
import {
  loginUser,
  verifyUser,
  registerUser,
  updateUser,
  fetchUsers,
  getUserById,
} from "../controllers/user.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

router.route("/verify-user").get(verifyJWT, verifyUser);
router.route("/update-user/:id").put(verifyJWT, updateUser);
router.route("/fetch-users").get(verifyJWT,fetchUsers);
router.route("/fetch-users/:id").get(verifyJWT,getUserById);

export default router;
