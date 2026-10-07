import { Router } from "express";
import {
  adminLogin,
  adminLogout,
} from "./admin-auth.controller";

const router = Router();

router.post("/login", adminLogin);
router.post("/logout", adminLogout);

export default router;