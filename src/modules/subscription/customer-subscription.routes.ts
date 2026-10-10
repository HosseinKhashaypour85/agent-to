import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { getMySubscriptions } from "./customer-subscription.controller";

const router = Router();

router.get("/me", authMiddleware, getMySubscriptions);

export default router;
