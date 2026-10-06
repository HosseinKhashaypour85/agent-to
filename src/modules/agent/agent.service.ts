import {
  randomUUID,
} from "crypto";

import Agent from "../../models/Agent";
import Site from "../../models/Site";
import SiteChatSettings from "../../models/SiteChatSettings";

const DEFAULT_PROMPT =
  "شما دستیار هوشمند کسب‌وکار هستید. پاسخ‌ها را دقیق، مفید و محترمانه ارائه دهید.";

// ============================================================
// Create Agent
// ============================================================

export async function createAgent(
  tenantId: string,
  data: Record<string, unknown>
) {
  if (!tenantId?.trim()) {
    throw new Error(
      "TENANT_ID_REQUIRED"
    );
  }

  const existingAgent =
    await Agent.findOne({
      where: { tenantId },
    });

  if (existingAgent) {
    throw new Error(
      "AGENT_ALREADY_EXISTS"
    );
  }

  const agent =
    await Agent.create({
      id:
        randomUUID(),
      tenantId,

      name:
        typeof data.name ===
          "string" &&
        data.name.trim()
          ? data.name.trim()
          : "AI Agent",

      description:
        typeof data.description ===
          "string"
          ? data.description.trim() ||
            null
          : null,

      systemPrompt:
        typeof data.systemPrompt ===
          "string" &&
        data.systemPrompt.trim()
          ? data.systemPrompt.trim()
          : DEFAULT_PROMPT,

      language:
        typeof data.language ===
          "string" &&
        data.language.trim()
          ? data.language.trim()
          : "fa",

      tone:
        typeof data.tone ===
          "string" &&
        data.tone.trim()
          ? data.tone.trim()
          : "friendly",

      isActive:
        typeof data.isActive ===
          "boolean"
          ? data.isActive
          : true,
    });

  return agent;
}

// ============================================================
// Get Agent
// ============================================================

export async function getAgent(
  tenantId: string
) {
  if (!tenantId?.trim()) {
    throw new Error(
      "TENANT_ID_REQUIRED"
    );
  }

  const agent =
    await Agent.findOne({
      where: { tenantId },
    });

  if (!agent) {
    throw new Error(
      "AGENT_NOT_FOUND"
    );
  }

  return agent;
}

// ============================================================
// Update Agent
// ============================================================

export async function updateAgent(
  tenantId: string,
  data: Record<string, unknown>
) {
  const agent =
    await getAgent(
      tenantId
    );

  const allowedFields = [
    "name",
    "description",
    "systemPrompt",
    "language",
    "tone",
    "isActive",
  ];

  const updateData: Record<
    string,
    unknown
  > = {};

  for (
    const field of allowedFields
  ) {
    if (data[field] !== undefined) {
      updateData[field] =
        data[field];
    }
  }

  await agent.update(updateData);

  return agent;
}

// ============================================================
// Toggle Agent
// ============================================================

export async function toggleAgent(
  tenantId: string,
  isActive: boolean
) {
  const agent =
    await getAgent(
      tenantId
    );

  await agent.update(
    { isActive }
  );

  return agent;
}

// ============================================================
// Get Agent Sites
// ============================================================

export async function getAgentSites(
  tenantId: string
) {
  if (!tenantId?.trim()) {
    throw new Error(
      "TENANT_ID_REQUIRED"
    );
  }

  const agent =
    await Agent.findOne({
      where: { tenantId },
    });

  if (!agent) {
    throw new Error(
      "AGENT_NOT_FOUND"
    );
  }

  const sites =
    await Site.findAll({
      where: { tenantId },
      order: [
        ["createdAt", "DESC"],
      ],
    });

  return {
    agent,
    sites,
  };
}

// ============================================================
// Update Personality
// ============================================================

export async function updatePersonality(
  tenantId: string,
  data: Record<string, unknown>
) {
  const agent =
    await getAgent(
      tenantId
    );

  const updateData: Record<
    string,
    unknown
  > = {};

  if (
    typeof data.name ===
      "string" &&
    data.name.trim()
  ) {
    updateData.name =
      data.name.trim();
  }

  if (
    typeof data.description ===
      "string"
  ) {
    updateData.description =
      data.description.trim() ||
      null;
  }

  if (
    typeof data.systemPrompt ===
      "string"
  ) {
    updateData.systemPrompt =
      data.systemPrompt.trim();
  }

  if (
    typeof data.language ===
      "string" &&
    data.language.trim()
  ) {
    updateData.language =
      data.language.trim();
  }

  if (
    typeof data.tone ===
      "string" &&
    data.tone.trim()
  ) {
    updateData.tone =
      data.tone.trim();
  }

  await agent.update(updateData);

  return agent;
}

// ============================================================
// Get Appearance
// ============================================================

export async function getAppearance(
  tenantId: string,
  siteId: string
) {
  if (!tenantId?.trim()) {
    throw new Error(
      "TENANT_ID_REQUIRED"
    );
  }

  if (!siteId?.trim()) {
    throw new Error(
      "SITE_ID_REQUIRED"
    );
  }

  const site =
    await Site.findOne({
      where: {
        id: siteId,
        tenantId,
      },
    });

  if (!site) {
    throw new Error(
      "SITE_NOT_FOUND"
    );
  }

  const settings =
    await SiteChatSettings.findOne({
      where: {
        siteId:
          site.id,
      },
    });

  if (!settings) {
    throw new Error(
      "CHAT_SETTINGS_NOT_FOUND"
    );
  }

  return {
    site,
    settings,
  };
}

// ============================================================
// Update Appearance
// ============================================================

export async function updateAppearance(
  tenantId: string,
  siteId: string,
  data: Record<string, unknown>
) {
  if (!tenantId?.trim()) {
    throw new Error(
      "TENANT_ID_REQUIRED"
    );
  }

  if (!siteId?.trim()) {
    throw new Error(
      "SITE_ID_REQUIRED"
    );
  }

  const site =
    await Site.findOne({
      where: {
        id: siteId,
        tenantId,
      },
    });

  if (!site) {
    throw new Error(
      "SITE_NOT_FOUND"
    );
  }

  const settings =
    await SiteChatSettings.findOne({
      where: {
        siteId:
          site.id,
      },
    });

  if (!settings) {
    throw new Error(
      "CHAT_SETTINGS_NOT_FOUND"
    );
  }

  const allowedFields = [
    "primaryColor",
    "secondaryColor",
    "backgroundColor",
    "surfaceColor",
    "userMessageColor",
    "aiMessageColor",
    "textColor",
    "borderColor",
    "buttonTextColor",
    "logoUrl",
    "welcomeTitle",
    "welcomeMessage",
    "onlineLabel",
    "responseTimeText",
    "phone",
    "address",
    "inputPlaceholder",
    "footerText",
    "showPhone",
    "showAddress",
    "showFooter",
    "quickActions",
  ];

  const updateData: Record<
    string,
    unknown
  > = {};

  for (
    const field of allowedFields
  ) {
    if (data[field] !== undefined) {
      updateData[field] =
        data[field];
    }
  }

  await settings.update(updateData);

  return {
    site,
    settings,
  };
}
