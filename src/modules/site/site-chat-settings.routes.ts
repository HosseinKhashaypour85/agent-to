import { Router } from "express";

import {
  getSettings,
  updateSettings,
  getPublicConfig,
} from "./site-chat-settings.controller";

import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.get(
  "/public/sites/:siteId/config",
  getPublicConfig
);

router.get(
  "/sites/:id/chat-settings",
  authMiddleware,
  getSettings
);

router.patch(
  "/sites/:id/chat-settings",
  authMiddleware,
  updateSettings
);

export default router;