import { Response } from "express";

import { AuthRequest } from "../../middlewares/auth.middleware";

import {
  createMessage,
  getMessages,
  getMessageById,
} from "./message.service";

export async function create(
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
      sender,
      content,
      messageType,
    } = req.body || {};

    if (
      !conversationId ||
      !sender ||
      !content
    ) {
      return res.status(400).json({
        success: false,
        message:
          "conversationId, sender and content are required",
      });
    }

    const message = await createMessage({
      tenantId: req.user.tenantId,
      conversationId,
      sender,
      content,
      messageType,
    });

    return res.status(201).json({
      success: true,
      message: "Message created successfully",
      data: message,
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

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function list(
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

    const messages = await getMessages(
      req.user.tenantId,
      String(req.params.conversationId)
    );

    return res.status(200).json({
      success: true,
      data: messages,
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

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getOne(
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

    const message = await getMessageById(
      req.user.tenantId,
      String(req.params.id)
    );

    return res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error: any) {
    if (
      error.message === "MESSAGE_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}