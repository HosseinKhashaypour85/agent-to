import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { getMySubscription } from "./customer-account.controller";

const router = Router();
router.use(authMiddleware);
router.get("/subscription", getMySubscription);

export default router;
