import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { createTicket, getTicket, listAdminTickets, listCustomerTickets, replyToTicket, updateTicket } from "./support.service";

function handleError(res: Response, error: any, fallback: string) {
  const message = error instanceof Error ? error.message : "";
  const clientErrors: Record<string, [number, string]> = {
    INVALID_TICKET_SUBJECT: [400, "Subject is required and must be at most 191 characters"],
    INVALID_TICKET_MESSAGE: [400, "Message is required and must be at most 10000 characters"],
    INVALID_TICKET_STATUS: [400, "Invalid ticket status"],
    INVALID_TICKET_PRIORITY: [400, "Invalid ticket priority"],
    TICKET_NOT_FOUND: [404, "Ticket not found"],
    TICKET_CLOSED: [409, "This ticket is closed"],
  };
  if (clientErrors[message]) {
    const [status, publicMessage] = clientErrors[message];
    return res.status(status).json({ success: false, message: publicMessage });
  }
  console.error(fallback, error);
  return res.status(500).json({ success: false, message: fallback });
}

export async function createCustomerTicket(req: AuthRequest, res: Response) {
  try {
    if (!req.user?.tenantId || !req.user.userId) return res.status(403).json({ success: false, message: "Tenant access required" });
    const { subject, category, priority, message } = req.body || {};
    const ticket = await createTicket({ tenantId: req.user.tenantId, userId: req.user.userId, subject: String(subject || ""), category, priority, message: String(message || "") });
    return res.status(201).json({ success: true, ticket });
  } catch (error) { return handleError(res, error, "Failed to create support ticket"); }
}

export async function getCustomerTickets(req: AuthRequest, res: Response) {
  try {
    if (!req.user?.tenantId) return res.status(403).json({ success: false, message: "Tenant access required" });
    const tickets = await listCustomerTickets(req.user.tenantId);
    return res.json({ success: true, tickets });
  } catch (error) { return handleError(res, error, "Failed to get support tickets"); }
}

export async function getCustomerTicket(req: AuthRequest, res: Response) {
  try {
    if (!req.user?.tenantId) return res.status(403).json({ success: false, message: "Tenant access required" });
    const ticket = await getTicket(String(req.params.id), req.user.tenantId);
    return res.json({ success: true, ticket });
  } catch (error) { return handleError(res, error, "Failed to get support ticket"); }
}

export async function customerReply(req: AuthRequest, res: Response) {
  try {
    if (!req.user?.tenantId || !req.user.userId) return res.status(403).json({ success: false, message: "Tenant access required" });
    const ticket = await replyToTicket({ ticketId: String(req.params.id), tenantId: req.user.tenantId, userId: req.user.userId, role: req.user.role, message: String(req.body?.message || "") });
    return res.json({ success: true, ticket });
  } catch (error) { return handleError(res, error, "Failed to send ticket message"); }
}

export async function getAdminTickets(req: AuthRequest, res: Response) {
  try {
    const tickets = await listAdminTickets({ status: req.query.status as string, priority: req.query.priority as string, search: req.query.search as string });
    return res.json({ success: true, tickets });
  } catch (error) { return handleError(res, error, "Failed to get support tickets"); }
}

export async function getAdminTicket(req: AuthRequest, res: Response) {
  try {
    const ticket = await getTicket(String(req.params.id));
    return res.json({ success: true, ticket });
  } catch (error) { return handleError(res, error, "Failed to get support ticket"); }
}

export async function adminReply(req: AuthRequest, res: Response) {
  try {
    if (!req.user?.userId) return res.status(401).json({ success: false, message: "Authentication required" });
    const ticket = await replyToTicket({ ticketId: String(req.params.id), userId: req.user.userId, role: req.user.role, message: String(req.body?.message || "") });
    return res.json({ success: true, ticket });
  } catch (error) { return handleError(res, error, "Failed to send support reply"); }
}

export async function updateAdminTicket(req: AuthRequest, res: Response) {
  try {
    const ticket = await updateTicket({ ticketId: String(req.params.id), status: req.body?.status, priority: req.body?.priority });
    return res.json({ success: true, ticket });
  } catch (error) { return handleError(res, error, "Failed to update support ticket"); }
}
