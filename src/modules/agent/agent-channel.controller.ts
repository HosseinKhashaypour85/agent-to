import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";

import {
  createChannel,
  getChannels,
  toggleChannel,
  updateChannel,
} from "./agent-channel.service";

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

    const channels = await getChannels(
      req.user.tenantId
    );

    return res.status(200).json({
      success: true,
      channels,
    });
  } catch (error: any) {
    console.error(
      "GET CHANNELS ERROR:",
      error
    );

    if (error?.message === "AGENT_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Agent not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

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

    const { type } = req.body || {};

    const channel = await createChannel(
      req.user.tenantId,
      type,
      req.body || {}
    );

    return res.status(201).json({
      success: true,
      message: "Channel created successfully",
      channel,
    });
  } catch (error: any) {
    console.error(
      "CREATE CHANNEL ERROR:",
      error
    );

    if (error?.message === "AGENT_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Agent not found",
      });
    }

    if (
      error?.message ===
      "INVALID_CHANNEL_TYPE"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid channel type",
      });
    }

    if (
      error?.message ===
      "CHANNEL_ALREADY_EXISTS"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "This channel already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function update(
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

    const channel = await updateChannel(
      req.user.tenantId,
      String(req.params.id),
      req.body || {}
    );

    return res.status(200).json({
      success: true,
      message: "Channel updated successfully",
      channel,
    });
  } catch (error: any) {
    console.error(
      "UPDATE CHANNEL ERROR:",
      error
    );

    if (
      error?.message === "CHANNEL_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Channel not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function toggle(
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

    const { isActive } = req.body || {};

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message:
          "isActive must be boolean",
      });
    }

    const channel = await toggleChannel(
      req.user.tenantId,
      String(req.params.id),
      isActive
    );

    return res.status(200).json({
      success: true,
      message: "Channel status updated",
      channel,
    });
  } catch (error: any) {
    console.error(
      "TOGGLE CHANNEL ERROR:",
      error
    );

    if (
      error?.message === "CHANNEL_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Channel not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}