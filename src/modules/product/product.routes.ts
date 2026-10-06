import { Router } from "express";

import { authMiddleware } from "../../middlewares/auth.middleware";

import {
  create,
  list,
  getOne,
  update,
  remove,
} from "./product.controller";

const router = Router();

router.use(authMiddleware);

router.post("/", create);
router.get("/", list);
router.get("/:id", getOne);
router.patch("/:id", update);
router.delete("/:id", remove);

export default router;