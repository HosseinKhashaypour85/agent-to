import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";

import {
  createAgent,
  getAgent,
  toggleAgent,
  updateAgent,
} from "./agent.service";

export async function create(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const agent = await createAgent(
      req.user.tenantId,
      req.body || {}
    );

    return res.status(201).json({
      success: true,
      message: "Agent created successfully",
      agent,
    });
  } catch (error: any) {
    console.error("CREATE AGENT ERROR:", error);

    if (error?.message === "TENANT_ID_REQUIRED") {
      return res.status(400).json({
        success: false,
        message: "Tenant ID is required",
      });
    }

    if (error?.message === "AGENT_ALREADY_EXISTS") {
      return res.status(409).json({
        success: false,
        message: "Agent already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function get(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const agent = await getAgent(req.user.tenantId);

    return res.status(200).json({
      success: true,
      agent,
    });
  } catch (error: any) {
    console.error("GET AGENT ERROR:", error);

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

export async function update(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const agent = await updateAgent(
      req.user.tenantId,
      req.body || {}
    );

    return res.status(200).json({
      success: true,
      message: "Agent updated successfully",
      agent,
    });
  } catch (error: any) {
    console.error("UPDATE AGENT ERROR:", error);

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

export async function toggle(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const isActive = Boolean(req.body?.isActive);

    const agent = await toggleAgent(
      req.user.tenantId,
      isActive
    );

    return res.status(200).json({
      success: true,
      message: isActive
        ? "Agent activated successfully"
        : "Agent deactivated successfully",
      agent,
    });
  } catch (error: any) {
    console.error("TOGGLE AGENT ERROR:", error);

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