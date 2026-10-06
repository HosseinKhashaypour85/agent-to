import { Router } from "express";

import {
  create,
  list,
  getOne,
} from "./customer.controller";

import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.post(
  "/",
  authMiddleware,
  create
);

router.get(
  "/",
  authMiddleware,
  list
);

router.get(
  "/:id",
  authMiddleware,
  getOne
);

export default router;