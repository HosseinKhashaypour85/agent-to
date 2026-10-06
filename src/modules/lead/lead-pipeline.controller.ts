import { Request, Response } from "express";
import {
  getLeadPipeline,
  getLeadPipelineStats,
  moveLead,
} from "./lead-pipeline.service";

import { LeadStatus } from "../../models/Lead";

interface AuthRequest extends Request {
  user?: {
    userId: string;
    tenantId: string;
    email: string;
    role: string;
  };
}

const VALID_STATUSES: LeadStatus[] = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "PROPOSAL",
  "WON",
  "LOST",
];

export async function getPipeline(
  req: AuthRequest,
  res: Response
) {
  try {
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const result = await getLeadPipeline(tenantId);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Get Lead Pipeline Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get lead pipeline",
    });
  }
}

export async function getPipelineStats(
  req: AuthRequest,
  res: Response
) {
  try {
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const result = await getLeadPipelineStats(tenantId);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Get Lead Pipeline Stats Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get pipeline stats",
    });
  }
}

export async function movePipelineLead(
  req: AuthRequest,
  res: Response
) {
  try {
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { id } = req.params;
    const { status } = req.body || {};

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Lead ID is required",
      });
    }

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lead status",
        validStatuses: VALID_STATUSES,
      });
    }

    const lead = await moveLead(
      tenantId,
      String(id),
      status
    );

    return res.status(200).json({
      success: true,
      message: "Lead status updated successfully",
      lead,
    });
  } catch (error) {
    console.error("Move Lead Pipeline Error:", error);

    if (
      error instanceof Error &&
      error.message === "LEAD_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    if (
      error instanceof Error &&
      error.message.startsWith("INVALID_LEAD_TRANSITION")
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid lead status transition",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to move lead",
    });
  }
}