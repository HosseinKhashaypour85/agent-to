import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";

import {
  getCustomerConversations,
  getConversationDetails,
  getConversationMessages,
  getCustomerHistorySummary,
  getCustomerTimeline,
  getCustomerFullProfile,
} from "./customer-history.service";

export async function getCustomerConversationsController(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const customerId = String(req.params.customerId);
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 20, 100);

    const result = await getCustomerConversations(req.user.tenantId, customerId, {
      page,
      limit,
    });

    return res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    if (error.message === "CUSTOMER_NOT_FOUND") {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function getConversationDetailsController(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const conversationId = String(req.params.conversationId);
    const result = await getConversationDetails(req.user.tenantId, conversationId);

    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    if (error.message === "CONVERSATION_NOT_FOUND") {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function getConversationMessagesController(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const conversationId = String(req.params.conversationId);
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 50, 100);

    const result = await getConversationMessages(req.user.tenantId, conversationId, {
      page,
      limit,
    });

    return res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    if (error.message === "CONVERSATION_NOT_FOUND") {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function getCustomerHistoryController(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const customerId = String(req.params.customerId);
    const result = await getCustomerHistorySummary(req.user.tenantId, customerId);

    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    if (error.message === "CUSTOMER_NOT_FOUND") {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function getCustomerTimelineController(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const customerId = String(req.params.customerId);
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 50, 100);

    const result = await getCustomerTimeline(req.user.tenantId, customerId, {
      page,
      limit,
    });

    return res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    if (error.message === "CUSTOMER_NOT_FOUND") {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function getCustomerProfileController(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const customerId = String(req.params.customerId);
    const result = await getCustomerFullProfile(req.user.tenantId, customerId);

    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    if (error.message === "CUSTOMER_NOT_FOUND") {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}