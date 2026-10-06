import { Response } from "express";

import { AuthRequest } from "../../middlewares/auth.middleware";

import {
  createConversation,
  getConversations,
  getConversationById,
  updateConversationStatus,
} from "./conversation.service";

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
      customerId,
      channel,
    } = req.body || {};

    if (!customerId || !channel) {
      return res.status(400).json({
        success: false,
        message:
          "customerId and channel are required",
      });
    }

    const conversation =
      await createConversation({
        tenantId: req.user.tenantId,
        customerId,
        channel,
      });

    return res.status(201).json({
      success: true,
      message:
        "Conversation created successfully",
      data: conversation,
    });
  } catch (error: any) {
    if (
      error.message ===
      "CUSTOMER_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
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

    const conversations =
      await getConversations(
        req.user.tenantId
      );

    return res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
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

    const conversation =
      await getConversationById(
        req.user.tenantId,
        String(req.params.id)
      );

    return res.status(200).json({
      success: true,
      data: conversation,
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

export async function updateStatus(
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

    const { status } = req.body || {};

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "status is required",
      });
    }

    const conversation =
      await updateConversationStatus(
        req.user.tenantId,
        String(req.params.id),
        status
      );

    return res.status(200).json({
      success: true,
      message:
        "Conversation status updated successfully",
      data: conversation,
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