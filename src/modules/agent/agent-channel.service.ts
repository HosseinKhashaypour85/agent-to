import { randomUUID } from "crypto";

import Agent from "../../models/Agent";
import AgentChannel, {
  ChannelType,
} from "../../models/AgentChannel";

const CHANNEL_NAMES: Record<ChannelType, string> = {
  WEBSITE: "Website",
  WORDPRESS: "WordPress",
  TELEGRAM: "Telegram",
  WHATSAPP: "WhatsApp",
};

function toSafeChannel(channel: AgentChannel) {
  const config = (channel.config as Record<string, unknown> | null) || {};
  const { botToken, ...safeConfig } = config;

  return {
    ...channel.toJSON(),
    config: {
      ...safeConfig,
      ...(botToken ? { hasBotToken: true } : {}),
    },
  };
}

export async function getChannels(
  tenantId: string
) {
  const agent = await Agent.findOne({
    where: { tenantId },
  });

  if (!agent) {
    throw new Error("AGENT_NOT_FOUND");
  }

  const channels = await AgentChannel.findAll({
    where: {
      tenantId,
      agentId: agent.id,
    },
    order: [["createdAt", "ASC"]],
  });

  // Never expose the Telegram bot token through the generic channels API.
  return channels.map(toSafeChannel);
}

export async function createChannel(
  tenantId: string,
  type: ChannelType,
  data: Record<string, unknown>
) {
  const agent = await Agent.findOne({
    where: { tenantId },
  });

  if (!agent) {
    throw new Error("AGENT_NOT_FOUND");
  }

  if (!isValidChannelType(type)) {
    throw new Error("INVALID_CHANNEL_TYPE");
  }

  const existing = await AgentChannel.findOne({
    where: {
      agentId: agent.id,
      type,
    },
  });

  if (existing) {
    throw new Error("CHANNEL_ALREADY_EXISTS");
  }

  const channel = await AgentChannel.create({
    id: randomUUID(),
    tenantId,
    agentId: agent.id,

    type,

    name:
      typeof data.name === "string" &&
      data.name.trim()
        ? data.name.trim()
        : CHANNEL_NAMES[type],

    isActive:
      typeof data.isActive === "boolean"
        ? data.isActive
        : false,

    config:
      data.config &&
      typeof data.config === "object"
        ? data.config
        : null,
  });

  return channel;
}

export async function updateChannel(
  tenantId: string,
  channelId: string,
  data: Record<string, unknown>
) {
  const channel = await AgentChannel.findOne({
    where: {
      id: channelId,
      tenantId,
    },
  });

  if (!channel) {
    throw new Error("CHANNEL_NOT_FOUND");
  }

  const updateData: Record<string, unknown> = {};

  if (
    typeof data.name === "string" &&
    data.name.trim()
  ) {
    updateData.name = data.name.trim();
  }

  if (typeof data.isActive === "boolean") {
    updateData.isActive = data.isActive;
  }

  if (
    data.config &&
    typeof data.config === "object"
  ) {
    updateData.config = data.config;
  }

  await channel.update(updateData);

  return toSafeChannel(channel);
}

export async function toggleChannel(
  tenantId: string,
  channelId: string,
  isActive: boolean
) {
  const channel = await AgentChannel.findOne({
    where: {
      id: channelId,
      tenantId,
    },
  });

  if (!channel) {
    throw new Error("CHANNEL_NOT_FOUND");
  }

  await channel.update({
    isActive,
  });

  return toSafeChannel(channel);
}

function isValidChannelType(
  type: string
): type is ChannelType {
  return (
    type === "WEBSITE" ||
    type === "WORDPRESS" ||
    type === "TELEGRAM" ||
    type === "WHATSAPP"
  );
}