import { Router } from "express";

import {
  create,
  getOne,
  list,
  remove,
  update,
} from "./subscription.controller";

import {
  authMiddleware,
} from "../../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.post("/", create);

router.get("/", list);

router.get("/:id", getOne);

router.patch("/:id", update);

router.delete("/:id", remove);

export default router;