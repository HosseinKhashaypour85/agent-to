import { Router } from "express";

import {
  create,
  list,
  getOne,
  remove,
} from "./knowledge.controller";

import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/", authMiddleware, create);

router.get("/", authMiddleware, list);

router.get("/:id", authMiddleware, getOne);

router.delete("/:id", authMiddleware, remove);

export default router;