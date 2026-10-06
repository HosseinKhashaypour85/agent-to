import { Router } from "express";

import {
  create,
  getOne,
  list,
  remove,
  update,
} from "./plan.controller";

import {
  authMiddleware,
} from "../../middlewares/auth.middleware";

import { superAdminMiddleware } from "../../middlewares/super-admin.middleware";

const router =
  Router();

router.use(
  authMiddleware
);

router.use(superAdminMiddleware);

router.post(
  "/",
  create
);

router.get(
  "/",
  list
);

router.get(
  "/:id",
  getOne
);

router.patch(
  "/:id",
  update
);

router.delete(
  "/:id",
  remove
);

export default router;