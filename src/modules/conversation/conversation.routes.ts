import { Router } from "express";

import {
  create,
  list,
  getOne,
  updateStatus,
} from "./conversation.controller";

import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

// Create conversation
router.post(
  "/",
  authMiddleware,
  create
);

// Get all conversations
router.get(
  "/",
  authMiddleware,
  list
);

// Get conversation by ID
router.get(
  "/:id",
  authMiddleware,
  getOne
);

// Update conversation status
router.patch(
  "/:id/status",
  authMiddleware,
  updateStatus
);

export default router;