import { Response } from "express";

import { AuthRequest } from "../../middlewares/auth.middleware";

import {
  createLead,
  getLeads,
  getLeadById,
  updateLeadStatus,
} from "./lead.service";

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
      title,
      description,
      source,
      value,
      assignedTo,
      expectedCloseDate,
      notes,
    } = req.body || {};

    if (!customerId || !title) {
      return res.status(400).json({
        success: false,
        message: "customerId and title are required",
      });
    }

    const lead = await createLead({
      tenantId: req.user.tenantId,
      customerId,
      title,
      description,
      source,
      value,
      assignedTo,
      expectedCloseDate,
      notes,
    });

    return res.status(201).json({
      success: true,
      message: "Lead created successfully",
      data: lead,
    });
  } catch (error) {
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

    const { status, source } = req.query;

    const leads = await getLeads(
      req.user.tenantId,
      {
        status: status as any,
        source: source as any,
      }
    );

    return res.status(200).json({
      success: true,
      data: leads,
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

    const lead = await getLeadById(
      req.user.tenantId,
      String(req.params.id)
    );

    return res.status(200).json({
      success: true,
      data: lead,
    });
  } catch (error: any) {
    if (error.message === "LEAD_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
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

    const lead = await updateLeadStatus(
      req.user.tenantId,
      String(req.params.id),
      status
    );

    return res.status(200).json({
      success: true,
      message: "Lead status updated successfully",
      data: lead,
    });
  } catch (error: any) {
    if (error.message === "LEAD_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}