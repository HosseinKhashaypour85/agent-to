import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { superAdminMiddleware } from "../../middlewares/super-admin.middleware";
import {
  createAdminSiteInstallToken,
  listAdminSites,
  updateAdminSiteStatus,
} from "./site.controller";

const router = Router();
router.use(authMiddleware, superAdminMiddleware);

router.get("/", listAdminSites);
router.patch("/:id/status", updateAdminSiteStatus);
router.post("/:id/install-token", createAdminSiteInstallToken);

export default router;
