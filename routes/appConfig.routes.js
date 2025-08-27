import Router from "express";

import { getAppConfig, updateAppConfig, addAppConfig, deleteAppConfig } from "../controllers/appConfig.controller.js";

const router = Router();

router.route("/app-config").get(getAppConfig) ;
router.route("/app-config/:id").put(updateAppConfig);
router.route("/app-config").post(addAppConfig);
router.route("/app-config/:id").delete(deleteAppConfig);

export default router;
