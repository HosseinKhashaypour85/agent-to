import { Router } from "express";

import {
  getBusinessOverviewController,
} from "./business-overview.controller";

import { authMiddleware } from "../../middlewares/auth.middleware";
import { superAdminMiddleware } from "../../middlewares/super-admin.middleware";

const router = Router();

router.use(authMiddleware);
router.use(superAdminMiddleware);

router.get(
  "/:id/overview",
  getBusinessOverviewController
);

export default router;