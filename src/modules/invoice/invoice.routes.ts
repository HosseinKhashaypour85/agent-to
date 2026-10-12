import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { getOne, list } from "./invoice.controller";

const router = Router();
router.use(authMiddleware);
router.get("/", list);
router.get("/:id", getOne);

export default router;
