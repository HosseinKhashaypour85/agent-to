import {
  Request,
  Response,
} from "express";

import Site from "../../models/Site";
import Customer from "../../models/Customer";
import Conversation from "../../models/Conversation";
import Message from "../../models/Message";

import {
  processChat,
} from "./chat.gateway.service";


// ============================================================
// POST /api/v1/chat
// ============================================================

export async function chat(
  req: Request,
  res: Response
) {
  try {

    const {
      siteId,
      visitorId,
      message,

      channel,

      username,
      firstName,
      lastName,
      phone,
      email,
    } = req.body || {};


    const result =
      await processChat({
        siteId,
        visitorId,
        message,

        channel,

        username,
        firstName,
        lastName,
        phone,
        email,
      });


    return res.status(200).json(
      result
    );

  } catch (error: any) {

    console.error(
      "CHAT GATEWAY ERROR:",
      error
    );


    const errorMap: Record<
      string,
      {
        status: number;
        message: string;
      }
    > = {

      SITE_ID_REQUIRED: {
        status: 400,
        message:
          "siteId is required",
      },

      VISITOR_ID_REQUIRED: {
        status: 400,
        message:
          "visitorId is required",
      },

      MESSAGE_REQUIRED: {
        status: 400,
        message:
          "message is required",
      },

      SITE_NOT_FOUND: {
        status: 404,
        message:
          "Site not found or inactive",
      },

      CHANNEL_NOT_ACTIVE: {
        status: 404,
        message:
          "No active agent channel for this site",
      },

      AI_SERVICE_PAYMENT_REQUIRED: {
        status: 503,
        message:
          "AI service is temporarily unavailable. Please try again later.",
      },

      AI_SERVICE_ERROR: {
        status: 500,
        message:
          "AI service error. Please try again later.",
      },

      AGENT_NOT_ACTIVE: {
        status: 503,
        message:
          "Agent is not active",
      },

      CONVERSATION_NOT_FOUND: {
        status: 404,
        message:
          "Conversation not found",
      },

      CONVERSATION_ID_REQUIRED: {
        status: 400,
        message:
          "conversationId is required",
      },
    };


    const knownError =
      errorMap[error?.message];


    if (knownError) {
      return res
        .status(knownError.status)
        .json({
          success: false,
          message:
            knownError.message,
        });
    }


    if (
      error?.name ===
      "SequelizeDatabaseError"
    ) {
      return res
        .status(503)
        .json({
          success: false,
          message:
            "Service temporarily unavailable. Please try again.",
        });
    }


    return res
      .status(500)
      .json({
        success: false,
        message:
          "Internal server error",
      });
  }
}

// ============================================================
// GET /api/v1/chat/history?siteId=...&visitorId=...
// History is scoped to both site and browser visitor.
// ============================================================

export async function getHistory(
  req: Request,
  res: Response
) {
  try {
    const siteId = String(req.query.siteId || "").trim();
    const visitorId = String(req.query.visitorId || "").trim();

    if (!siteId || !visitorId) {
      return res.status(400).json({
        success: false,
        message: "siteId and visitorId are required",
      });
    }

    const site = await Site.findOne({
      where: { siteId, status: "ACTIVE" },
    });

    if (!site) {
      return res.status(404).json({
        success: false,
        message: "Site not found or inactive",
      });
    }

    const customer = await Customer.findOne({
      where: {
        tenantId: site.tenantId,
        telegramId: `visitor:${site.siteId}:${visitorId}`,
      },
    });

    if (!customer) {
      return res.status(200).json({ success: true, data: [] });
    }

    const conversations = await Conversation.findAll({
      where: {
        tenantId: site.tenantId,
        customerId: customer.id,
        channel: "WEBSITE",
      },
      order: [["createdAt", "DESC"]],
      limit: 10,
    });

    if (!conversations.length) {
      return res.status(200).json({ success: true, data: [] });
    }

    const conversationIds = conversations.map((item) => item.id);
    const messages = await Message.findAll({
      where: {
        tenantId: site.tenantId,
        conversationId: conversationIds,
      },
      order: [["createdAt", "ASC"]],
      limit: 200,
    });

    return res.status(200).json({
      success: true,
      data: messages.map((item) => ({
        id: item.id,
        sender: item.sender,
        content: item.content,
        createdAt: item.createdAt,
        conversationId: item.conversationId,
      })),
    });
  } catch (error) {
    console.error("[CHAT HISTORY ERROR]", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load chat history",
    });
  }
}
