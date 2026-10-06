import { Router } from "express";

import {
  create,
  list,
  getOne,
} from "./message.controller";

import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

// Create Message
router.post(
  "/",
  authMiddleware,
  create
);

// Get Messages of Conversation
router.get(
  "/conversation/:conversationId",
  authMiddleware,
  list
);

// Get Message by ID
router.get(
  "/:id",
  authMiddleware,
  getOne
);

export default router;