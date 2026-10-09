import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { getMyUsage } from "./usage.controller";

const router = Router();

router.use(authMiddleware);

router.get("/me", getMyUsage);

export default router;