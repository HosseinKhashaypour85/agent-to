import { Router } from "express";

import {
  createBusinessController,
  deleteBusinessController,
  getBusinessController,
  getBusinessesController,
  updateBusinessController,
  updateBusinessStatusController,
} from "./business.controller";

import { authMiddleware } from "../../middlewares/auth.middleware";
import { superAdminMiddleware } from "../../middlewares/super-admin.middleware";

const router = Router();

router.use(authMiddleware);
router.use(superAdminMiddleware);

router.post("/", createBusinessController);

router.get("/", getBusinessesController);

router.get("/:id", getBusinessController);

router.patch("/:id", updateBusinessController);

router.patch(
  "/:id/status",
  updateBusinessStatusController
);

router.delete(
  "/:id",
  deleteBusinessController
);

export default router;