import { Router } from "express";

import {
  create,
  list,
  createInstallToken,
  install,
  getInstallScript,
} from "./site.controller";

import {
  createInstallToken as createInstallTokenBySiteId,
} from "./site-install-token.controller";

import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/", authMiddleware, create);

router.get("/", authMiddleware, list);

// Public installation endpoint
router.post("/install", install);

// Create installation token by site ID
router.post(
  "/install-token",
  authMiddleware,
  createInstallTokenBySiteId
);

// Create installation token
router.post(
  "/:id/install",
  authMiddleware,
  createInstallToken
);

// Get installation script (public)
router.get("/install/script", getInstallScript);

export default router;