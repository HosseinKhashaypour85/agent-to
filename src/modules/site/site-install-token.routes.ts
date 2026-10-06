import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
  createInstallToken,
} from "./site-install-token.controller";

const router = Router();

router.post(
  "/install-token",
  authMiddleware,
  createInstallToken
);

export default router;