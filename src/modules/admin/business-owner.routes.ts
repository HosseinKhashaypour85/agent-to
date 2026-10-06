import { Router } from "express";

import {
  getBusinessOwnerController,
  assignBusinessOwnerController,
  removeBusinessOwnerController,
} from "./business-owner.controller";

import { authMiddleware } from "../../middlewares/auth.middleware";
import { superAdminMiddleware } from "../../middlewares/super-admin.middleware";

const router = Router();

router.use(authMiddleware);
router.use(superAdminMiddleware);

router.get(
  "/:id/owner",
  getBusinessOwnerController
);

router.patch(
  "/:id/owner",
  assignBusinessOwnerController
);

router.delete(
  "/:id/owner",
  removeBusinessOwnerController
);

export default router;