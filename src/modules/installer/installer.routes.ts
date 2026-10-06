import { Router } from "express";

import {
  getInstallerScript,
} from "./installer.controller";

const router = Router();

router.get(
  "/install",
  getInstallerScript
);

export default router;