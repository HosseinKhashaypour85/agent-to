import { Op } from "sequelize";
import { sequelize } from "../../config/database";
import SupportTicket, { SupportTicketPriority, SupportTicketStatus } from "../../models/SupportTicket";
import SupportTicketMessage, { SupportMessageSenderType } from "../../models/SupportTicketMessage";

const statuses: SupportTicketStatus[] = ["OPEN", "IN_PROGRESS", "WAITING_CUSTOMER", "ANSWERED", "CLOSED"];
const priorities: SupportTicketPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export async function createTicket(input: {
  tenantId: string; userId: string; subject: string; category?: string;
  priority?: SupportTicketPriority; message: string;
}) {
  const subject = input.subject.trim();
  const message = input.message.trim();
  if (!subject || subject.length > 191) throw new Error("INVALID_TICKET_SUBJECT");
  if (!message || message.length > 10000) throw new Error("INVALID_TICKET_MESSAGE");
  if (input.priority && !priorities.includes(input.priority)) throw new Error("INVALID_TICKET_PRIORITY");

  return sequelize.transaction(async (transaction) => {
    const ticket = await SupportTicket.create({
      tenantId: input.tenantId,
      createdByUserId: input.userId,
      subject,
      category: (input.category || "GENERAL").trim().slice(0, 100),
      priority: input.priority || "MEDIUM",
      status: "OPEN",
      lastMessageAt: new Date(),
    }, { transaction });

    const firstMessage = await SupportTicketMessage.create({
      ticketId: ticket.id,
      tenantId: input.tenantId,
      senderUserId: input.userId,
      senderType: "CUSTOMER",
      message,
    }, { transaction });

    return { ...ticket.toJSON(), messages: [firstMessage] };
  });
}

export async function listCustomerTickets(tenantId: string) {
  return SupportTicket.findAll({
    where: { tenantId },
    order: [["lastMessageAt", "DESC"]],
    limit: 100,
    attributes: { exclude: [] },
  });
}

export async function listAdminTickets(filters: { status?: string; priority?: string; search?: string }) {
  const where: any = {};
  if (filters.status) {
    if (!statuses.includes(filters.status as SupportTicketStatus)) throw new Error("INVALID_TICKET_STATUS");
    where.status = filters.status;
  }
  if (filters.priority) {
    if (!priorities.includes(filters.priority as SupportTicketPriority)) throw new Error("INVALID_TICKET_PRIORITY");
    where.priority = filters.priority;
  }
  if (filters.search?.trim()) {
    where[Op.or] = [
      { subject: { [Op.like]: `%${filters.search.trim().slice(0, 100)}%` } },
      { id: { [Op.like]: `%${filters.search.trim().slice(0, 100)}%` } },
      { tenantId: { [Op.like]: `%${filters.search.trim().slice(0, 100)}%` } },
    ];
  }
  return SupportTicket.findAll({ where, order: [["lastMessageAt", "DESC"]], limit: 200 });
}

async function findTicket(ticketId: string, tenantId?: string) {
  const where: any = { id: ticketId };
  if (tenantId) where.tenantId = tenantId;
  const ticket = await SupportTicket.findOne({ where });
  if (!ticket) throw new Error("TICKET_NOT_FOUND");
  return ticket;
}

export async function getTicket(ticketId: string, tenantId?: string) {
  const ticket = await findTicket(ticketId, tenantId);
  const messages = await SupportTicketMessage.findAll({
    where: { ticketId: ticket.id, tenantId: ticket.tenantId },
    order: [["createdAt", "ASC"]],
  });
  return { ...ticket.toJSON(), messages };
}

export async function replyToTicket(input: {
  ticketId: string; tenantId?: string; userId: string; role: string; message: string;
}) {
  const message = input.message.trim();
  if (!message || message.length > 10000) throw new Error("INVALID_TICKET_MESSAGE");
  const isAdmin = input.role === "SUPER_ADMIN";
  const ticket = await findTicket(input.ticketId, isAdmin ? undefined : input.tenantId);
  if (ticket.status === "CLOSED") throw new Error("TICKET_CLOSED");

  const senderType: SupportMessageSenderType = isAdmin ? "SUPPORT" : "CUSTOMER";
  await sequelize.transaction(async (transaction) => {
    await SupportTicketMessage.create({
      ticketId: ticket.id,
      tenantId: ticket.tenantId,
      senderUserId: input.userId,
      senderType,
      message,
    }, { transaction });

    ticket.lastMessageAt = new Date();
    if (isAdmin) ticket.status = "WAITING_CUSTOMER";
    else ticket.status = "IN_PROGRESS";
    await ticket.save({ transaction });
  });
  return getTicket(ticket.id, isAdmin ? undefined : input.tenantId);
}

export async function updateTicket(input: {
  ticketId: string; status?: string; priority?: string;
}) {
  const ticket = await findTicket(input.ticketId);
  if (input.status !== undefined) {
    if (!statuses.includes(input.status as SupportTicketStatus)) throw new Error("INVALID_TICKET_STATUS");
    ticket.status = input.status as SupportTicketStatus;
  }
  if (input.priority !== undefined) {
    if (!priorities.includes(input.priority as SupportTicketPriority)) throw new Error("INVALID_TICKET_PRIORITY");
    ticket.priority = input.priority as SupportTicketPriority;
  }
  await ticket.save();
  return getTicket(ticket.id);
}
