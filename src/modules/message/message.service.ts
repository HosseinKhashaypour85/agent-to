import Message, {
  MessageSender,
  MessageType,
} from "../../models/Message";

import Conversation from "../../models/Conversation";

export async function createMessage(data: {
  tenantId: string;
  conversationId: string;
  sender: MessageSender;
  content: string;
  messageType?: MessageType;
}) {
  // بررسی Conversation و Tenant
  const conversation = await Conversation.findOne({
    where: {
      id: data.conversationId,
      tenantId: data.tenantId,
    },
  });

  if (!conversation) {
    throw new Error("CONVERSATION_NOT_FOUND");
  }

  const message = await Message.create({
    tenantId: data.tenantId,
    conversationId: data.conversationId,
    sender: data.sender,
    content: data.content,
    messageType: data.messageType || "TEXT",
  });

  return message;
}

export async function getMessages(
  tenantId: string,
  conversationId: string
) {
  // اول بررسی می‌کنیم Conversation متعلق به همین Tenant باشد
  const conversation = await Conversation.findOne({
    where: {
      id: conversationId,
      tenantId,
    },
  });

  if (!conversation) {
    throw new Error("CONVERSATION_NOT_FOUND");
  }

  return Message.findAll({
    where: {
      tenantId,
      conversationId,
    },
    order: [
      ["createdAt", "ASC"],
    ],
  });
}

export async function getMessageById(
  tenantId: string,
  messageId: string
) {
  const message = await Message.findOne({
    where: {
      id: messageId,
      tenantId,
    },
  });

  if (!message) {
    throw new Error("MESSAGE_NOT_FOUND");
  }

  return message;
}