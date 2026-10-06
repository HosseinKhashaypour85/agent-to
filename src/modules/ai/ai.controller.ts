import { Response } from "express";

import { AuthRequest } from "../../middlewares/auth.middleware";

import { chatWithAI } from "./ai.service";

export async function chat(
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

    const {
      conversationId,
      message,
    } = req.body || {};

    if (!conversationId || !message) {
      return res.status(400).json({
        success: false,
        message:
          "conversationId and message are required",
      });
    }

    const result = await chatWithAI({
      tenantId: req.user.tenantId,
      conversationId,
      userMessage: message,
    });

    return res.status(200).json({
      success: true,
      data: {
        userMessage: result.userMessage,
        aiMessage: result.aiMessage,
        history: result.history,
      },
    });
  } catch (error: any) {
    if (
      error.message ===
      "CONVERSATION_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    console.error("AI Chat Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}