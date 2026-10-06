import { Router } from "express";

import {
  create,
  list,
  getOne,
  updateStatus,
} from "./lead.controller";

import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

// Create Lead
router.post(
  "/",
  authMiddleware,
  create
);

// Get all Leads
router.get(
  "/",
  authMiddleware,
  list
);

// Get Lead by ID
router.get(
  "/:id",
  authMiddleware,
  getOne
);

// Update Lead Status
router.patch(
  "/:id/status",
  authMiddleware,
  updateStatus
);

export default router;