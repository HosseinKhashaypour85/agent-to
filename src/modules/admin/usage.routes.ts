import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { superAdminMiddleware } from "../../middlewares/super-admin.middleware";
import { getAdminUsage } from "../usage/usage.controller";

const router = Router();

router.use(authMiddleware);
router.use(superAdminMiddleware);

router.get("/", getAdminUsage);

export default router;