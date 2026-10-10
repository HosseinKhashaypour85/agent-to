import { randomUUID } from "crypto";
import Site from "../../models/Site";
import SiteChatSettings from "../../models/SiteChatSettings";


// ======================================================
// Default Chat Settings
// ======================================================

function getDefaultChatSettings() {
  return {
    logoUrl: null,

    // Theme
    primaryColor: "#10706B",
    secondaryColor: "#0D5C58",
    accentColor: "#F59E0B",

    backgroundColor: "#F8F9FC",
    surfaceColor: "#FFFFFF",

    userMessageColor: "#F1F3F5",
    aiMessageColor: "#10706B",

    textColor: "#171717",
    borderColor: "#E5E7EB",

    buttonTextColor: "#FFFFFF",

    // Welcome
    welcomeTitle: "سلام 👋",
    welcomeMessage: "چطور می‌توانیم کمکتان کنیم؟",

    // Status
    onlineLabel: "آنلاین",
    responseTimeText: "معمولاً کمتر از ۲ دقیقه",

    // Business
    phone: null,
    address: null,

    // Composer
    inputPlaceholder: "پیام خود را بنویسید...",

    // Footer
    footerText: null,

    // Visibility
    showPhone: true,
    showAddress: true,
    showFooter: true,

    // Quick Actions
    quickActions: [],
  };
}


// ======================================================
// دریافت تنظیمات Chat
// ======================================================

export async function getChatSettings(
  siteId: string,
  tenantId?: string
) {
  if (!siteId?.trim()) {
    throw new Error("SITE_ID_REQUIRED");
  }

  const where: any = {
    siteId: siteId.trim(),
  };

  // CRM
  if (tenantId) {
    where.tenantId = tenantId;
  }

  const site = await Site.findOne({
    where,
  });

  if (!site) {
    throw new Error("SITE_NOT_FOUND");
  }

  let settings = await SiteChatSettings.findOne({
    where: {
      siteId: site.id,
    },
  });

  // اگر تنظیمات وجود نداشت
  if (!settings) {
    settings = await SiteChatSettings.create({
      id: randomUUID(),
      siteId: site.id,

      ...getDefaultChatSettings(),
    });
  }

  return {
    site: {
      id: site.id,
      siteId: site.siteId,
      domain: site.domain,
      name: site.name,
      status: site.status,
    },

    settings,
  };
}


// ======================================================
// آپدیت تنظیمات Chat از CRM
// ======================================================

export async function updateChatSettings(
  siteId: string,
  tenantId: string,
  data: Record<string, unknown>
) {
  if (!siteId?.trim()) {
    throw new Error("SITE_ID_REQUIRED");
  }

  if (!tenantId?.trim()) {
    throw new Error("TENANT_ID_REQUIRED");
  }

  // siteId اینجا UUID داخلی Site است
  const site = await Site.findOne({
    where: {
      id: siteId.trim(),
      tenantId,
    },
  });

  if (!site) {
    throw new Error("SITE_NOT_FOUND");
  }

  let settings = await SiteChatSettings.findOne({
    where: {
      siteId: site.id,
    },
  });

  // اگر تنظیمات وجود نداشت
  if (!settings) {
    settings = await SiteChatSettings.create({
      id: randomUUID(),
      siteId: site.id,

      ...getDefaultChatSettings(),
    });
  }

  // ====================================================
  // فیلدهای قابل ویرایش از CRM
  // ====================================================

  const allowedFields = [
    // Theme
    "primaryColor",
    "secondaryColor",
    "accentColor",
    "backgroundColor",
    "surfaceColor",
    "userMessageColor",
    "aiMessageColor",
    "textColor",
    "borderColor",
    "buttonTextColor",

    // Branding
    "logoUrl",

    // Welcome
    "welcomeTitle",
    "welcomeMessage",

    // Status
    "onlineLabel",
    "responseTimeText",

    // Business
    "phone",
    "address",

    // Composer
    "inputPlaceholder",

    // Footer
    "footerText",

    // Visibility
    "showPhone",
    "showAddress",
    "showFooter",

    // Quick Actions
    "quickActions",
  ];

  const updateData: Record<string, unknown> = {};

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  }

  await settings.update(updateData);

  return {
    site: {
      id: site.id,
      siteId: site.siteId,
      domain: site.domain,
      name: site.name,
      status: site.status,
    },

    settings,
  };
}