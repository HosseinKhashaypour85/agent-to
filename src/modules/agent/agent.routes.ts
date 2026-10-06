import { Router } from "express";

import {
  create,
  get,
  update,
  toggle,
} from "./agent.controller";

import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.post("/", create);
router.get("/", get);
router.patch("/", update);
router.patch("/toggle", toggle);

export default router;