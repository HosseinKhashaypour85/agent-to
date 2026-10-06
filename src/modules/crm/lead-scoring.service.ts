import LeadScore from "../../models/LeadScore";
import Customer from "../../models/Customer";
import Conversation from "../../models/Conversation";
import Message from "../../models/Message";
import Lead from "../../models/Lead";

import { extractAndStoreMemory } from "./customer-memory.service";

export interface LeadScoreResult {
  score: number;
  temperature: "COLD" | "WARM" | "HOT";
  reasons: string[];
  signals: Record<string, number>;
  aiAnalysis: string;
}

interface ScoringSignal {
  name: string;
  weight: number;
  description: string;
}

const RULE_BASED_SIGNALS: ScoringSignal[] = [
  { name: "product_interest", weight: 10, description: "محصول خاص مورد علاقه" },
  { name: "specific_product_identified", weight: 10, description: "محصول مشخص شناسایی شده" },
  { name: "price_requested", weight: 10, description: "قیمت درخواست شده" },
  { name: "stock_requested", weight: 8, description: "موجودی درخواست شده" },
  { name: "shipping_requested", weight: 5, description: "ارسال درخواست شده" },
  { name: "warranty_requested", weight: 5, description: "گارانتی درخواست شده" },
  { name: "payment_requested", weight: 8, description: "پرداخت درخواست شده" },
  { name: "purchase_process_requested", weight: 15, description: "فرآیند خرید پرسیده" },
  { name: "explicit_buying_intent", weight: 20, description: "قصد خرید مستقیم" },
  { name: "multiple_conversations", weight: 5, description: "چندین مکالمه" },
  { name: "repeated_product_interest", weight: 5, description: "علاقه مکرر به محصول" },
  { name: "cart_order_intent", weight: 15, description: "نیت سبد/سفارش" },
  { name: "negative_behavior", weight: -5, description: "رفتار منفی/بی‌تفاوت" },
  { name: "long_inactivity", weight: -5, description: "غیرفعالی طولانی" },
];

const MAX_SCORE = 100;

export async function calculateLeadScore(data: {
  tenantId: string;
  customerId: string;
  leadId?: string | null;
  triggerEvent?: string;
}): Promise<LeadScoreResult> {
  const { tenantId, customerId, leadId, triggerEvent } = data;

  if (!tenantId?.trim()) throw new Error("TENANT_ID_REQUIRED");
  if (!customerId?.trim()) throw new Error("CUSTOMER_ID_REQUIRED");

  const customer = await Customer.findOne({ where: { id: customerId, tenantId } });
  if (!customer) throw new Error("CUSTOMER_NOT_FOUND");

  const conversations = await Conversation.findAll({
    where: { tenantId, customerId },
    order: [["createdAt", "DESC"]],
  });

  const messages = await Message.findAll({
    where: { tenantId, conversationId: conversations.map((c) => c.id) },
    order: [["createdAt", "ASC"]],
  });

  const leads = await Lead.findAll({
    where: { tenantId, customerId },
    order: [["createdAt", "DESC"]],
  });

  const signals: Record<string, number> = {};
  const reasons: string[] = [];

  await evaluateRuleBasedSignals({
    conversations,
    messages,
    leads,
    signals,
    reasons,
  });

  const aiAnalysis = await evaluateAiSignals({
    tenantId,
    customerId,
    conversations,
    messages,
    leads,
    signals,
    reasons,
  });

  let totalScore = Object.values(signals).reduce((sum, val) => sum + val, 0);
  totalScore = Math.max(0, Math.min(MAX_SCORE, totalScore));

  const temperature = totalScore >= 75 ? "HOT" : totalScore >= 40 ? "WARM" : "COLD";

  const existingScore = await LeadScore.findOne({ where: { tenantId, customerId } });
  if (existingScore) {
    existingScore.score = totalScore;
    existingScore.temperature = temperature;
    existingScore.reasons = reasons;
    existingScore.signals = signals;
    existingScore.aiAnalysis = aiAnalysis;
    existingScore.lastCalculatedAt = new Date();
    if (leadId) existingScore.leadId = leadId;
    await existingScore.save();
  } else {
    await LeadScore.create({
      tenantId,
      customerId,
      leadId: leadId || null,
      score: totalScore,
      temperature,
      reasons,
      signals,
      aiAnalysis,
      lastCalculatedAt: new Date(),
    });
  }

  return { score: totalScore, temperature, reasons, signals, aiAnalysis };
}

async function evaluateRuleBasedSignals(data: {
  conversations: Conversation[];
  messages: Message[];
  leads: Lead[];
  signals: Record<string, number>;
  reasons: string[];
}) {
  const { conversations, messages, leads, signals, reasons } = data;

  const userMessages = messages.filter((m) => m.sender === "USER");
  const aiMessages = messages.filter((m) => m.sender === "AI");

  const intents = new Set<string>();
  const productNames = new Set<string>();
  let priceInquired = false;
  let stockInquired = false;
  let shippingInquired = false;
  let paymentInquired = false;
  let orderIntent = false;
  let warrantyInquired = false;
  let explicitBuying = false;

  const buyingKeywords = ["میخوام", "می‌خوام", "سفارش", "خرید", "بخرم", "پرداخت", "ثبت سفارش", "خریداری", "می‌خواهم"];

  for (const msg of userMessages) {
    const text = msg.content.toLowerCase();

    if (buyingKeywords.some((kw) => text.includes(kw))) {
      explicitBuying = true;
    }
  }

  for (const lead of leads) {
    if (lead.title?.toLowerCase().includes("قیمت")) priceInquired = true;
    if (lead.title?.toLowerCase().includes("موجود")) stockInquired = true;
    if (lead.title?.toLowerCase().includes("خرید")) explicitBuying = true;
    if (lead.description) {
      const desc = lead.description.toLowerCase();
      if (desc.includes("قیمت")) priceInquired = true;
      if (desc.includes("موجود")) stockInquired = true;
      if (desc.includes("خرید") || desc.includes("سفارش")) explicitBuying = true;
    }
  }

  if (explicitBuying) {
    signals.explicit_buying_intent = (signals.explicit_buying_intent || 0) + 20;
    reasons.push("قصد خرید مستقیم اعلام شده");
  }

  if (priceInquired) {
    signals.price_requested = (signals.price_requested || 0) + 10;
    reasons.push("قیمت محصول پرسیده");
  }

  if (stockInquired) {
    signals.stock_requested = (signals.stock_requested || 0) + 8;
    reasons.push("موجودی بررسی شده");
  }

  if (shippingInquired) {
    signals.shipping_requested = (signals.shipping_requested || 0) + 5;
    reasons.push("درباره ارسال سؤال شده");
  }

  if (paymentInquired) {
    signals.payment_requested = (signals.payment_requested || 0) + 8;
    reasons.push("روش پرداخت پرسیده");
  }

  if (warrantyInquired) {
    signals.warranty_requested = (signals.warranty_requested || 0) + 5;
    reasons.push("گارانتی پرسیده");
  }

  if (orderIntent) {
    signals.purchase_process_requested = (signals.purchase_process_requested || 0) + 15;
    reasons.push("فرآیند خرید پرسیده");
  }

  if (conversations.length >= 3) {
    signals.multiple_conversations = (signals.multiple_conversations || 0) + 5;
    reasons.push(`${conversations.length} مکالمه انجام شده`);
  }

  const recentConversations = conversations.filter((c) => {
    const diffHours = (Date.now() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60);
    return diffHours <= 24;
  });
  if (recentConversations.length >= 3) {
    reasons.push(`${recentConversations.length} مکالمه در 24 ساعت اخیر`);
  }

  const productFromMemory = new Set<string>();
  for (const msg of userMessages) {
    // Product name extraction would be done via intent detection
    // This is simplified - real extraction happens in intent service
  }

  if (productNames.size > 0) {
    signals.specific_product_identified = (signals.specific_product_identified || 0) + 10;
    signals.product_interest = (signals.product_interest || 0) + 10;
    reasons.push(`محصول مشخص: ${Array.from(productNames).join(", ")}`);
  }

  const lastConversation = conversations[0];
  if (lastConversation) {
    const daysSinceLastConversation = (Date.now() - new Date(lastConversation.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceLastConversation > 30) {
      signals.long_inactivity = (signals.long_inactivity || 0) - 5;
    }
  }

  const positiveSignals = Object.entries(signals).filter(([_, v]) => v > 0).length;
  if (positiveSignals > 5) {
    // Cap to prevent inflation
    const totalPositive = Object.values(signals).filter((v) => v > 0).reduce((a, b) => a + b, 0);
    if (totalPositive > MAX_SCORE) {
      const factor = MAX_SCORE / totalPositive;
      for (const key of Object.keys(signals)) {
        if (signals[key] > 0) {
          signals[key] = Math.round(signals[key] * factor);
        }
      }
    }
  }
}

async function evaluateAiSignals(data: {
  tenantId: string;
  customerId: string;
  conversations: Conversation[];
  messages: Message[];
  leads: Lead[];
  signals: Record<string, number>;
  reasons: string[];
}): Promise<string> {
  // In production, this would call an AI model for semantic analysis
  // For now, return a structured analysis based on rule-based signals
  const { conversations, messages, leads } = data;

  const userMessageCount = messages.filter((m) => m.sender === "USER").length;
  const conversationCount = conversations.length;
  const leadCount = leads.length;

  const lastUserMessage = [...messages].reverse().find((m) => m.sender === "USER")?.content || "";

  let analysis = `تحلیلLead Score:\n`;
  analysis += `- تعداد مکالمه‌ها: ${conversationCount}\n`;
  analysis += `- تعداد پیام‌های کاربر: ${userMessageCount}\n`;
  analysis += `- تعداد لیدها: ${leadCount}\n`;
  analysis += `- آخرین پیام: "${lastUserMessage.slice(0, 100)}"\n`;

  const positiveSignals = Object.entries(data.signals).filter(([_, v]) => v > 0);
  if (positiveSignals.length > 0) {
    analysis += `\nسیگنال‌های مثبت شناسایی شده:\n`;
    for (const [signal, value] of positiveSignals) {
      const signalInfo = RULE_BASED_SIGNALS.find((s) => s.name === signal);
      analysis += `  ✓ ${signalInfo?.description || signal}: +${value}\n`;
    }
  }

  const negativeSignals = Object.entries(data.signals).filter(([_, v]) => v < 0);
  if (negativeSignals.length > 0) {
    analysis += `\nسیگنال‌های منفی:\n`;
    for (const [signal, value] of negativeSignals) {
      const signalInfo = RULE_BASED_SIGNALS.find((s) => s.name === signal);
      analysis += `  ✗ ${signalInfo?.description || signal}: ${value}\n`;
    }
  }

  return analysis;
}

export async function getLeadScore(tenantId: string, customerId: string) {
  if (!tenantId?.trim()) throw new Error("TENANT_ID_REQUIRED");
  if (!customerId?.trim()) throw new Error("CUSTOMER_ID_REQUIRED");

  const leadScore = await LeadScore.findOne({ where: { tenantId, customerId } });
  if (!leadScore) return null;

  return {
    score: leadScore.score,
    temperature: leadScore.temperature,
    reasons: leadScore.reasons,
    signals: leadScore.signals,
    aiAnalysis: leadScore.aiAnalysis,
    lastCalculatedAt: leadScore.lastCalculatedAt,
  };
}

export async function getLeadsByTemperature(tenantId: string, temperature: "COLD" | "WARM" | "HOT") {
  return await LeadScore.findAll({
    where: { tenantId, temperature },
    order: [["score", "DESC"]],
    include: [
      {
        model: Customer,
        as: "customer",
        attributes: ["id", "firstName", "lastName", "phone", "email"],
      },
    ],
  });
}

export async function getTopHotLeads(tenantId: string, limit = 10) {
  console.log("getTopHotLeads called with:", { tenantId, limit });
  try {
    return await LeadScore.findAll({
      where: { tenantId, temperature: "HOT" },
      order: [["score", "DESC"]],
      limit,
      include: [
        {
          model: Customer,
          as: "customer",
          attributes: ["id", "firstName", "lastName", "phone", "email"],
        },
      ],
    });
  } catch (error) {
    console.error("getTopHotLeads error:", error);
    throw error;
  }
}

export async function getLeadScoreStats(tenantId: string) {
  const [hot, warm, cold] = await Promise.all([
    LeadScore.count({ where: { tenantId, temperature: "HOT" } }),
    LeadScore.count({ where: { tenantId, temperature: "WARM" } }),
    LeadScore.count({ where: { tenantId, temperature: "COLD" } }),
  ]);

  const topHot = await getTopHotLeads(tenantId, 5);

  return { hot, warm, cold, topHot };
}

export function getTemperatureLabel(temperature: string) {
  const labels: Record<string, string> = {
    HOT: "داغ 🔥",
    WARM: "گرم 🟡",
    COLD: "سرد 🔵",
  };
  return labels[temperature] || temperature;
}

export function getRecommendation(temperature: "COLD" | "WARM" | "HOT", score: number) {
  if (temperature === "HOT") {
    return "این مشتری آماده خرید به نظر می‌رسد. پیشنهاد می‌شود در اسرع وقت پیگیری شود.";
  }
  if (temperature === "WARM") {
    return "مشتری علاقه‌مند است اما هنوز تصمیم خرید قطعی ندارد. اطلاعات بیشتری درباره محصول ارائه دهید.";
  }
  return "فعلاً نشانه خرید قوی مشاهده نشده است.";
}