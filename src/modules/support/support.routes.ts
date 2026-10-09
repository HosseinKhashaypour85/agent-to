import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { createCustomerTicket, customerReply, getCustomerTicket, getCustomerTickets } from "./support.controller";

const router = Router();
router.use(authMiddleware);
router.post("/tickets", createCustomerTicket);
router.get("/tickets", getCustomerTickets);
router.get("/tickets/:id", getCustomerTicket);
router.post("/tickets/:id/messages", customerReply);
export default router;
