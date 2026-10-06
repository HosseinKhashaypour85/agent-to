import { Router } from "express";

import { chat } from "./ai.controller";

import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.post(
  "/chat",
  authMiddleware,
  chat
);

export default router;