import { Router } from "express";

import {
  create,
  list,
  toggle,
  update,
} from "./agent-channel.controller";

import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/", list);

router.post("/", create);

router.patch("/:id", update);

router.patch("/:id/toggle", toggle);

export default router;