import { Router } from "express";

import {
  create,
  list,
  getSiteById,
  createInstallToken,
  install,
  getInstallScript,
} from "./site.controller";

import {
  createInstallToken as createInstallTokenBySiteId,
} from "./site-install-token.controller";

import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

const RESERVED_SITE_IDS = [
  "install",
  "install-info",
  "install-site-id",
  "install-token",
];

router.post("/", authMiddleware, create);

router.get("/", authMiddleware, list);

router.get(
  "/:id",
  (req, _res, next) => {
    const id = String(req.params.id || "").toLowerCase();

    if (RESERVED_SITE_IDS.includes(id)) {
      return next("route");
    }

    return next();
  },
  authMiddleware,
  getSiteById
);

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