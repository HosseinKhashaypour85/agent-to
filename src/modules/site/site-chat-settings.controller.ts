import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";

import {
  getChatSettings,
  updateChatSettings,
} from "./site-chat-settings.service";


// ======================================================
// CRM
// GET /api/v1/sites/:id/chat-settings
// ======================================================

export async function getSettings(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const result = await getChatSettings(
      String(req.params.id),
      req.user.tenantId
    );

    return res.status(200).json({
      success: true,

      site: result.site,

      settings: result.settings,
    });

  } catch (error: any) {

    console.error(
      "GET CHAT SETTINGS ERROR:",
      error
    );

    if (error?.message === "SITE_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Site not found",
      });
    }

    if (error?.message === "SITE_ID_REQUIRED") {
      return res.status(400).json({
        success: false,
        message: "Site ID is required",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}


// ======================================================
// CRM
// PATCH /api/v1/sites/:id/chat-settings
// ======================================================

export async function updateSettings(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const result = await updateChatSettings(
      String(req.params.id),
      req.user.tenantId,
      req.body || {}
    );

    return res.status(200).json({
      success: true,

      message: "Chat settings updated successfully",

      site: result.site,

      settings: result.settings,
    });

  } catch (error: any) {

    console.error(
      "UPDATE CHAT SETTINGS ERROR:",
      error
    );

    if (error?.message === "SITE_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Site not found",
      });
    }

    if (error?.message === "SITE_ID_REQUIRED") {
      return res.status(400).json({
        success: false,
        message: "Site ID is required",
      });
    }

    if (error?.message === "TENANT_ID_REQUIRED") {
      return res.status(400).json({
        success: false,
        message: "Tenant ID is required",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}


// ======================================================
// PUBLIC
// GET /api/v1/public/sites/:siteId/config
// ======================================================

export async function getPublicConfig(
  req: AuthRequest,
  res: Response
) {
  try {

    const result = await getChatSettings(
      String(req.params.siteId)
    );

    return res.status(200).json({
      success: true,

      // ================================================
      // Site
      // ================================================

      site: {
        id: result.site.id,
        siteId: result.site.siteId,
        domain: result.site.domain,
        name: result.site.name,
        status: result.site.status,
      },

      // ================================================
      // Public Chat Settings
      // ================================================

      settings: {

        // ------------------------------
        // Theme
        // ------------------------------

        primaryColor:
          result.settings.primaryColor,

        secondaryColor:
          result.settings.secondaryColor,

        backgroundColor:
          result.settings.backgroundColor,

        surfaceColor:
          result.settings.surfaceColor,

        userMessageColor:
          result.settings.userMessageColor,

        aiMessageColor:
          result.settings.aiMessageColor,

        textColor:
          result.settings.textColor,

        borderColor:
          result.settings.borderColor,

        buttonTextColor:
          result.settings.buttonTextColor,


        // ------------------------------
        // Branding
        // ------------------------------

        logoUrl:
          result.settings.logoUrl,


        // ------------------------------
        // Welcome
        // ------------------------------

        welcomeTitle:
          result.settings.welcomeTitle,

        welcomeMessage:
          result.settings.welcomeMessage,


        // ------------------------------
        // Status
        // ------------------------------

        onlineLabel:
          result.settings.onlineLabel,

        responseTimeText:
          result.settings.responseTimeText,


        // ------------------------------
        // Business
        // ------------------------------

        phone:
          result.settings.phone,

        address:
          result.settings.address,


        // ------------------------------
        // Composer
        // ------------------------------

        inputPlaceholder:
          result.settings.inputPlaceholder,


        // ------------------------------
        // Footer
        // ------------------------------

        footerText:
          result.settings.footerText,


        // ------------------------------
        // Visibility
        // ------------------------------

        showPhone:
          result.settings.showPhone,

        showAddress:
          result.settings.showAddress,

        showFooter:
          result.settings.showFooter,


        // ------------------------------
        // Quick Actions
        // ------------------------------

        quickActions:
          result.settings.quickActions,
      },
    });

  } catch (error: any) {

    console.error(
      "PUBLIC CHAT CONFIG ERROR:",
      error
    );

    if (error?.message === "SITE_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Site not found",
      });
    }

    if (error?.message === "SITE_ID_REQUIRED") {
      return res.status(400).json({
        success: false,
        message: "Site ID is required",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}