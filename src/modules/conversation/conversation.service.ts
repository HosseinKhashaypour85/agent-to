import Conversation, {
  ConversationChannel,
  ConversationStatus,
} from "../../models/Conversation";

import Customer from "../../models/Customer";

export async function createConversation(data: {
  tenantId: string;
  customerId: string;
  channel: ConversationChannel;
}) {
  // بررسی اینکه Customer متعلق به همین Tenant باشد
  const customer = await Customer.findOne({
    where: {
      id: data.customerId,
      tenantId: data.tenantId,
    },
  });

  if (!customer) {
    throw new Error("CUSTOMER_NOT_FOUND");
  }

  const conversation = await Conversation.create({
    tenantId: data.tenantId,
    customerId: data.customerId,
    channel: data.channel,
    status: "OPEN",
  });

  return conversation;
}

export async function getConversations(
  tenantId: string
) {
  return Conversation.findAll({
    where: {
      tenantId,
    },
    order: [
      ["createdAt", "DESC"],
    ],
  });
}

export async function getConversationById(
  tenantId: string,
  conversationId: string
) {
  const conversation =
    await Conversation.findOne({
      where: {
        id: conversationId,
        tenantId,
      },
    });

  if (!conversation) {
    throw new Error("CONVERSATION_NOT_FOUND");
  }

  return conversation;
}

export async function updateConversationStatus(
  tenantId: string,
  conversationId: string,
  status: ConversationStatus
) {
  const conversation =
    await Conversation.findOne({
      where: {
        id: conversationId,
        tenantId,
      },
    });

  if (!conversation) {
    throw new Error("CONVERSATION_NOT_FOUND");
  }

  conversation.status = status;

  await conversation.save();

  return conversation;
}