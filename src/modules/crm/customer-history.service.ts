import Conversation from "../../models/Conversation";
import Message from "../../models/Message";
import Customer from "../../models/Customer";
import Lead from "../../models/Lead";
import LeadScore from "../../models/LeadScore";

import { getLeadScore } from "./lead-scoring.service";

export interface CustomerConversationSummary {
  id: string;
  channel: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
  lastMessage: string | null;
  lastMessageTime: Date | null;
  detectedIntents: string[];
  relatedProducts: string[];
  leadStatus: string | null;
  leadScore: number | null;
}

export interface CustomerHistoryResponse {
  customer: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    email: string | null;
  };
  conversations: CustomerConversationSummary[];
  leadScore: {
    score: number;
    temperature: string;
    reasons: string[];
  } | null;
}

export interface TimelineEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  createdAt: Date;
  metadata?: Record<string, unknown>;
}

export async function getCustomerConversations(
  tenantId: string,
  customerId: string,
  options?: { page?: number; limit?: number }
) {
  if (!tenantId?.trim()) throw new Error("TENANT_ID_REQUIRED");
  if (!customerId?.trim()) throw new Error("CUSTOMER_ID_REQUIRED");

  const { page = 1, limit = 20 } = options || {};
  const offset = (page - 1) * limit;

  const customer = await Customer.findOne({ where: { id: customerId, tenantId } });
  if (!customer) throw new Error("CUSTOMER_NOT_FOUND");

  const { rows, count } = await Conversation.findAndCountAll({
    where: { tenantId, customerId },
    order: [["updatedAt", "DESC"]],
    limit,
    offset,
  });

  const summaries: CustomerConversationSummary[] = [];

  for (const conv of rows) {
    const messages = await Message.findAll({
      where: { tenantId, conversationId: conv.id },
      order: [["createdAt", "ASC"]],
    });

    const userMessages = messages.filter((m) => m.sender === "USER");
    const lastUserMessage = userMessages[userMessages.length - 1];
    const lastAiMessage = [...messages].reverse().find((m) => m.sender === "AI");

    const intents = new Set<string>();
    const products = new Set<string>();

    for (const msg of userMessages) {
      // Extract intents and products from messages
      // This is simplified - in production, you'd use stored intent data
      const text = msg.content.toLowerCase();
      if (text.includes("قیمت") || text.includes("چند")) intents.add("price");
      if (text.includes("موجود") || text.includes("چندتا")) intents.add("stock");
      if (text.includes("ارسال") || text.includes("چند روز")) intents.add("shipping");
      if (text.includes("پرداخت") || text.includes("کارت")) intents.add("payment");
      if (text.includes("سفارش") || text.includes("خرید")) intents.add("order");
      if (text.includes("مرجوع") || text.includes("پس دادن")) intents.add("return");
    }

    const leadScore = await LeadScore.findOne({ where: { tenantId, customerId } });
    const lead = await Lead.findOne({
      where: { tenantId, customerId },
      order: [["createdAt", "DESC"]],
    });

    summaries.push({
      id: conv.id,
      channel: conv.channel,
      status: conv.status,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
      messageCount: messages.length,
      lastMessage: lastUserMessage?.content || lastAiMessage?.content || null,
      lastMessageTime: lastUserMessage?.createdAt || lastAiMessage?.createdAt || null,
      detectedIntents: Array.from(intents),
      relatedProducts: Array.from(products),
      leadStatus: lead?.status || null,
      leadScore: leadScore?.score || null,
    });
  }

  return {
    data: summaries,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
}

export async function getConversationDetails(
  tenantId: string,
  conversationId: string
) {
  if (!tenantId?.trim()) throw new Error("TENANT_ID_REQUIRED");

  const conversation = await Conversation.findOne({
    where: { id: conversationId, tenantId },
  });

  if (!conversation) throw new Error("CONVERSATION_NOT_FOUND");

  const messages = await Message.findAll({
    where: { tenantId, conversationId },
    order: [["createdAt", "ASC"]],
  });

  const customer = await Customer.findByPk(conversation.customerId);
  const leadScore = await LeadScore.findOne({
    where: { tenantId, customerId: conversation.customerId },
  });

  return {
    conversation: {
      id: conversation.id,
      channel: conversation.channel,
      status: conversation.status,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    },
    customer: customer
      ? {
          id: customer.id,
          firstName: customer.firstName,
          lastName: customer.lastName,
          phone: customer.phone,
          email: customer.email,
        }
      : null,
    leadScore: leadScore
      ? {
          score: leadScore.score,
          temperature: leadScore.temperature,
          reasons: leadScore.reasons,
        }
      : null,
    messages: messages.map((m) => ({
      id: m.id,
      sender: m.sender,
      content: m.content,
      messageType: m.messageType,
      createdAt: m.createdAt,
    })),
  };
}

export async function getConversationMessages(
  tenantId: string,
  conversationId: string,
  options?: { page?: number; limit?: number }
) {
  if (!tenantId?.trim()) throw new Error("TENANT_ID_REQUIRED");

  const { page = 1, limit = 50 } = options || {};
  const offset = (page - 1) * limit;

  const conversation = await Conversation.findOne({
    where: { id: conversationId, tenantId },
  });

  if (!conversation) throw new Error("CONVERSATION_NOT_FOUND");

  const { rows, count } = await Message.findAndCountAll({
    where: { tenantId, conversationId },
    order: [["createdAt", "ASC"]],
    limit,
    offset,
  });

  return {
    data: rows.map((m) => ({
      id: m.id,
      sender: m.sender,
      content: m.content,
      messageType: m.messageType,
      createdAt: m.createdAt,
    })),
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
}

export async function getCustomerHistorySummary(tenantId: string, customerId: string) {
  if (!tenantId?.trim()) throw new Error("TENANT_ID_REQUIRED");
  if (!customerId?.trim()) throw new Error("CUSTOMER_ID_REQUIRED");

  const customer = await Customer.findOne({ where: { id: customerId, tenantId } });
  if (!customer) throw new Error("CUSTOMER_NOT_FOUND");

  const conversationsResult = await getCustomerConversations(tenantId, customerId, { limit: 100 });
  const leadScore = await LeadScore.findOne({ where: { tenantId, customerId } });

  const totalMessages = conversationsResult.data.reduce((sum, c) => sum + c.messageCount, 0);
  const totalConversations = conversationsResult.data.length;

  const channels = [...new Set(conversationsResult.data.map((c) => c.channel))];
  const allIntents = [...new Set(conversationsResult.data.flatMap((c) => c.detectedIntents))];
  const allProducts = [...new Set(conversationsResult.data.flatMap((c) => c.relatedProducts))];

  const lastConversation = conversationsResult.data[0];

  return {
    customer: {
      id: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      email: customer.email,
      createdAt: customer.createdAt,
    },
    summary: {
      totalConversations,
      totalMessages,
      channels,
      allIntents,
      allProducts,
      lastActivity: lastConversation?.updatedAt || customer.createdAt,
    },
    leadScore: leadScore
      ? {
          score: leadScore.score,
          temperature: leadScore.temperature,
          reasons: leadScore.reasons,
          aiAnalysis: leadScore.aiAnalysis,
          lastCalculatedAt: leadScore.lastCalculatedAt,
        }
      : null,
    conversations: conversationsResult.data,
  };
}

export async function getCustomerTimeline(
  tenantId: string,
  customerId: string,
  options?: { page?: number; limit?: number }
) {
  if (!tenantId?.trim()) throw new Error("TENANT_ID_REQUIRED");
  if (!customerId?.trim()) throw new Error("CUSTOMER_ID_REQUIRED");

  const { page = 1, limit = 50 } = options || {};
  const offset = (page - 1) * limit;

  const customer = await Customer.findOne({ where: { id: customerId, tenantId } });
  if (!customer) throw new Error("CUSTOMER_NOT_FOUND");

  const events: TimelineEvent[] = [];

  const conversations = await Conversation.findAll({
    where: { tenantId, customerId },
    order: [["createdAt", "DESC"]],
    limit: 20,
  });

  for (const conv of conversations) {
    events.push({
      id: `conv-${conv.id}`,
      type: "conversation_started",
      title: "مکالمه جدید",
      description: `مکالمه ${conv.channel} آغاز شد`,
      createdAt: conv.createdAt,
      metadata: { conversationId: conv.id, channel: conv.channel },
    });

    const messages = await Message.findAll({
      where: { tenantId, conversationId: conv.id },
      order: [["createdAt", "ASC"]],
    });

    for (const msg of messages.filter((m) => m.sender === "USER")) {
      let eventType = "message_sent";
      let title = "پیام ارسال شد";
      let description = msg.content.slice(0, 100);

      const text = msg.content.toLowerCase();
      if (text.includes("قیمت") || text.includes("چند")) {
        eventType = "price_requested";
        title = "قیمت درخواست شد";
      } else if (text.includes("موجود") || text.includes("چندتا")) {
        eventType = "stock_requested";
        title = "موجودی بررسی شد";
      } else if (text.includes("سفارش") || text.includes("خرید") || text.includes("میخوام") || text.includes("می‌خوام")) {
        eventType = "order_intent";
        title = "قصد خرید اعلام شد";
      } else if (text.includes("پرداخت") || text.includes("کارت")) {
        eventType = "payment_requested";
        title = "پرداخت پرسیده شد";
      } else if (text.includes("ارسال") || text.includes("چند روز")) {
        eventType = "shipping_requested";
        title = "ارسال پرسیده شد";
      }

      events.push({
        id: `msg-${msg.id}`,
        type: eventType,
        title,
        description,
        createdAt: msg.createdAt,
        metadata: { conversationId: conv.id, messageId: msg.id },
      });
    }
  }

  const leads = await Lead.findAll({
    where: { tenantId, customerId },
    order: [["createdAt", "DESC"]],
  });

  for (const lead of leads) {
    events.push({
      id: `lead-${lead.id}`,
      type: "lead_created",
      title: "لید ایجاد شد",
      description: lead.title || "لید جدید",
      createdAt: lead.createdAt,
      metadata: { leadId: lead.id, status: lead.status },
    });
  }

  const leadScores = await LeadScore.findAll({
    where: { tenantId, customerId },
    order: [["createdAt", "DESC"]],
  });

  for (const ls of leadScores) {
    events.push({
      id: `score-${ls.id}`,
      type: "lead_score_changed",
      title: "امتیاز لید به‌روزرسانی شد",
      description: `امتیاز: ${ls.score} (${ls.temperature})`,
      createdAt: ls.createdAt,
      metadata: { score: ls.score, temperature: ls.temperature },
    });
  }

  events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const paginatedEvents = events.slice(offset, offset + limit);

  return {
    data: paginatedEvents,
    pagination: {
      page,
      limit,
      total: events.length,
      totalPages: Math.ceil(events.length / limit),
    },
  };
}

export async function getCustomerFullProfile(tenantId: string, customerId: string) {
  const [history, timeline, leadScore] = await Promise.all([
    getCustomerHistorySummary(tenantId, customerId),
    getCustomerTimeline(tenantId, customerId, { limit: 30 }),
    getLeadScore(tenantId, customerId),
  ]);

  return {
    ...history,
    timeline: timeline.data,
    leadScore,
  };
}