import { randomUUID } from "crypto";

import Site from "../../models/Site";
import Customer from "../../models/Customer";
import Conversation from "../../models/Conversation";
import AgentChannel, {
  ChannelType,
} from "../../models/AgentChannel";

import { chatWithAI } from "../ai/ai.service";

export interface ChatGatewayInput {
  siteId: string;
  visitorId: string;
  message: string;

  channel?: ChannelType;

  username?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
}

export async function processChat(
  data: ChatGatewayInput
) {
  // ----------------------------------------
  // 1. Validate input
  // ----------------------------------------

  if (!data.siteId?.trim()) {
    throw new Error("SITE_ID_REQUIRED");
  }

  if (!data.visitorId?.trim()) {
    throw new Error("VISITOR_ID_REQUIRED");
  }

  if (!data.message?.trim()) {
    throw new Error("MESSAGE_REQUIRED");
  }

  // ----------------------------------------
  // 2. Find active site
  // ----------------------------------------

  const site = await Site.findOne({
    where: {
      siteId: data.siteId.trim(),
      status: "ACTIVE",
    },
  });

  if (!site) {
    throw new Error("SITE_NOT_FOUND");
  }

  // ----------------------------------------
  // 3. Determine channel
  // ----------------------------------------

  const channelType: ChannelType =
    data.channel ?? "WEBSITE";

  // ----------------------------------------
  // 4. Check Agent Channel
  // ----------------------------------------

  const channel = await AgentChannel.findOne({
    where: {
      tenantId: site.tenantId,
      type: channelType,
      isActive: true,
    },
  });

  if (!channel) {
    throw new Error("CHANNEL_NOT_ACTIVE");
  }

  // ----------------------------------------
  // 5. Find / create customer
  // ----------------------------------------

  const externalCustomerId =
    `visitor:${data.visitorId.trim()}`;

  let customer = await Customer.findOne({
    where: {
      tenantId: site.tenantId,
      telegramId: externalCustomerId,
    },
  });

  if (!customer) {
    customer = await Customer.create({
      id: randomUUID(),

      tenantId: site.tenantId,

      telegramId: externalCustomerId,

      username:
        data.username ?? null,

      firstName:
        data.firstName ?? null,

      lastName:
        data.lastName ?? null,

      phone:
        data.phone ?? null,

      email:
        data.email ?? null,

      referralCode: randomUUID(),

      referredBy: null,

      isActive: true,
    });
  } else {
    // ----------------------------------------
    // Update customer information
    // ----------------------------------------

    const updateData: Record<
      string,
      unknown
    > = {};

    if (
      data.username !== undefined
    ) {
      updateData.username =
        data.username;
    }

    if (
      data.firstName !== undefined
    ) {
      updateData.firstName =
        data.firstName;
    }

    if (
      data.lastName !== undefined
    ) {
      updateData.lastName =
        data.lastName;
    }

    if (
      data.phone !== undefined
    ) {
      updateData.phone =
        data.phone;
    }

    if (
      data.email !== undefined
    ) {
      updateData.email =
        data.email;
    }

    if (
      Object.keys(updateData).length > 0
    ) {
      await customer.update(
        updateData
      );
    }
  }

  // ----------------------------------------
  // 6. Find open conversation
  // ----------------------------------------

  let conversation =
    await Conversation.findOne({
      where: {
        tenantId: site.tenantId,

        customerId: customer.id,

        channel: channelType,

        status: "OPEN",
      },

      order: [
        ["createdAt", "DESC"],
      ],
    });

  // ----------------------------------------
  // 7. Create conversation
  // ----------------------------------------

  if (!conversation) {
    conversation =
      await Conversation.create({
        id: randomUUID(),

        tenantId:
          site.tenantId,

        customerId:
          customer.id,

        channel:
          channelType,

        status: "OPEN",
      });
  }

  // ----------------------------------------
  // 8. Send message to AI
  // ----------------------------------------

  const aiResult =
    await chatWithAI({
      tenantId:
        site.tenantId,

      conversationId:
        conversation.id,

      userMessage:
        data.message.trim(),
    });

  // ----------------------------------------
  // 9. Return gateway response
  // ----------------------------------------

  return {
    success: true,

    siteId:
      site.siteId,

    customerId:
      customer.id,

    conversationId:
      conversation.id,

    channel:
      channelType,

    message:
      aiResult.aiMessage.content,

    intent:
      aiResult.intent.intent,
  };
}