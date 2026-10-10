import { Router } from "express";

import {
  create,
  get,
  list,
  remove,
  update,
} from "./agent-products.controller";
import { importProductsController } from "./agent-products-import.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/", list);
router.get("/:id", get);

router.post("/import", importProductsController);
router.post("/", create);

router.patch("/:id", update);

router.delete("/:id", remove);

export default router;
