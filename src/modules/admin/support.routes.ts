import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { superAdminMiddleware } from "../../middlewares/super-admin.middleware";
import { adminReply, getAdminTicket, getAdminTickets, updateAdminTicket } from "../support/support.controller";

const router = Router();
router.use(authMiddleware, superAdminMiddleware);
router.get("/", getAdminTickets);
router.get("/:id", getAdminTicket);
router.post("/:id/messages", adminReply);
router.patch("/:id", updateAdminTicket);
export default router;
