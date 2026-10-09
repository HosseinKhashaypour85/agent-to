import { Request, Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import {
  getAdminUsageReport,
  getTenantUsageReport,
} from "./usage.service";

export async function getMyUsage(
  req: AuthRequest,
  res: Response
) {
  try {
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return res.status(403).json({
        success: false,
        message: "Tenant access required",
      });
    }

    const data = await getTenantUsageReport(
      tenantId,
      {
        from: req.query.from,
        to: req.query.to,
      }
    );

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    if (error?.message === "INVALID_USAGE_DATE_RANGE") {
      return res.status(400).json({
        success: false,
        message: "Invalid usage date range",
      });
    }

    console.error("GET MY USAGE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get usage report",
    });
  }
}

export async function getAdminUsage(
  req: Request,
  res: Response
) {
  try {
    const data = await getAdminUsageReport({
      from: req.query.from,
      to: req.query.to,
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    if (error?.message === "INVALID_USAGE_DATE_RANGE") {
      return res.status(400).json({
        success: false,
        message: "Invalid usage date range",
      });
    }

    console.error("GET ADMIN USAGE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get usage report",
    });
  }
}