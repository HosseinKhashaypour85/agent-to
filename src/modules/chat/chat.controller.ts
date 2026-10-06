import {
  Request,
  Response,
} from "express";

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