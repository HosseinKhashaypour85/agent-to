import { Router } from "express";

import {
  getDashboardStatsController,
} from "./dashboard-stats.controller";

import { authMiddleware } from "../../middlewares/auth.middleware";
import { superAdminMiddleware } from "../../middlewares/super-admin.middleware";

const router = Router();

router.use(authMiddleware);
router.use(superAdminMiddleware);

router.get(
  "/stats",
  getDashboardStatsController
);

export default router;
