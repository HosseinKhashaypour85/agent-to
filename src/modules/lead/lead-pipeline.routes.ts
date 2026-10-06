import { Router } from "express";

import { authMiddleware } from "../../middlewares/auth.middleware";

import {
  getPipeline,
  getPipelineStats,
  movePipelineLead,
} from "./lead-pipeline.controller";

const router = Router();

router.get(
  "/pipeline",
  authMiddleware,
  getPipeline
);

router.get(
  "/pipeline/stats",
  authMiddleware,
  getPipelineStats
);

router.patch(
  "/:id/pipeline",
  authMiddleware,
  movePipelineLead
);

export default router;