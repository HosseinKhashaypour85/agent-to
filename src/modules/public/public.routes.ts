import { Router } from "express";
import { listPublicPlans } from "./public-plans.controller";

const router = Router();

router.get("/plans", listPublicPlans);

export default router;
