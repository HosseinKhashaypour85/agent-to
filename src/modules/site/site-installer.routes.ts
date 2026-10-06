import { Router } from "express";

import {
  getInstallInfoController,
  getInstallSiteIdController,
  installSite,
} from "./site-installer.controller";

const router = Router();

router.get(
  "/install-info",
  getInstallInfoController
);

router.get(
  "/install-site-id",
  getInstallSiteIdController
);

router.get(
  "/install",
  installSite
);

router.post(
  "/install",
  installSite
);

export default router;