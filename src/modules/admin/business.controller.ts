import { Request, Response } from "express";

import {
  createBusiness,
  deleteBusiness,
  getBusinessById,
  getBusinesses,
  updateBusiness,
  updateBusinessStatus,
} from "./business.service";

export async function createBusinessController(
  req: Request,
  res: Response
) {
  try {
    const result = await createBusiness(req.body || {});

    return res.status(201).json({
      success: true,
      message: "Business created successfully",
      data: result.business,
      owner: result.owner,
    });
  } catch (error: any) {
    console.error("CREATE BUSINESS ERROR:", error);

    switch (error?.message) {
      case "BUSINESS_NAME_REQUIRED":
        return res.status(400).json({
          success: false,
          message: "Business name is required",
        });

      case "BUSINESS_SLUG_REQUIRED":
        return res.status(400).json({
          success: false,
          message: "Business slug is required",
        });

      case "BUSINESS_EMAIL_REQUIRED":
        return res.status(400).json({
          success: false,
          message: "Business email is required",
        });

      case "BUSINESS_SLUG_ALREADY_EXISTS":
        return res.status(409).json({
          success: false,
          message: "Business slug already exists",
        });

      case "OWNER_EMAIL_INVALID":
        return res.status(400).json({ success: false, message: "A valid owner login email is required" });

      case "OWNER_PASSWORD_TOO_SHORT":
        return res.status(400).json({ success: false, message: "Owner password must be at least 8 characters" });

      case "OWNER_EMAIL_ALREADY_EXISTS":
        return res.status(409).json({ success: false, message: "Owner login email already exists" });

      case "BUSINESS_EMAIL_ALREADY_EXISTS":
        return res.status(409).json({
          success: false,
          message: "Business email already exists",
        });

      default:
        if ((error as any)?.name === "SequelizeUniqueConstraintError") {
          return res.status(409).json({ success: false, message: "Business or owner email already exists" });
        }
        return res.status(500).json({
          success: false,
          message: "Failed to create business",
        });
    }
  }
}

export async function getBusinessesController(
  _req: Request,
  res: Response
) {
  try {
    const businesses = await getBusinesses();

    return res.status(200).json({
      success: true,
      data: businesses,
    });
  } catch (error) {
    console.error("GET BUSINESSES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get businesses",
    });
  }
}

export async function getBusinessController(
  req: Request,
  res: Response
) {
  try {
    const business = await getBusinessById(String(req.params.id));

    return res.status(200).json({
      success: true,
      data: business,
    });
  } catch (error: any) {
    console.error("GET BUSINESS ERROR:", error);

    if (error?.message === "BUSINESS_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to get business",
    });
  }
}

export async function updateBusinessController(
  req: Request,
  res: Response
) {
  try {
    const business = await updateBusiness(
      String(req.params.id),
      req.body || {}
    );

    return res.status(200).json({
      success: true,
      message: "Business updated successfully",
      data: business,
    });
  } catch (error: any) {
    console.error("UPDATE BUSINESS ERROR:", error);

    switch (error?.message) {
      case "BUSINESS_NOT_FOUND":
        return res.status(404).json({
          success: false,
          message: "Business not found",
        });

      case "BUSINESS_NAME_REQUIRED":
        return res.status(400).json({
          success: false,
          message: "Business name is required",
        });

      case "BUSINESS_SLUG_REQUIRED":
        return res.status(400).json({
          success: false,
          message: "Business slug is required",
        });

      case "BUSINESS_EMAIL_REQUIRED":
        return res.status(400).json({
          success: false,
          message: "Business email is required",
        });

      case "BUSINESS_SLUG_ALREADY_EXISTS":
        return res.status(409).json({
          success: false,
          message: "Business slug already exists",
        });

      case "BUSINESS_EMAIL_ALREADY_EXISTS":
        return res.status(409).json({
          success: false,
          message: "Business email already exists",
        });

      default:
        return res.status(500).json({
          success: false,
          message: "Failed to update business",
        });
    }
  }
}

export async function updateBusinessStatusController(
  req: Request,
  res: Response
) {
  try {
    const { status } = req.body || {};

    const allowedStatuses = [
      "ACTIVE",
      "SUSPENDED",
      "DEACTIVATED",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Allowed values: ACTIVE, SUSPENDED, DEACTIVATED",
      });
    }

    const business = await updateBusinessStatus(
      String(req.params.id),
      status
    );

    return res.status(200).json({
      success: true,
      message: "Business status updated successfully",
      data: business,
    });
  } catch (error: any) {
    console.error("UPDATE BUSINESS STATUS ERROR:", error);

    if (error?.message === "BUSINESS_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update business status",
    });
  }
}

export async function deleteBusinessController(
  req: Request,
  res: Response
) {
  try {
    const result = await deleteBusiness(String(req.params.id));

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("DELETE BUSINESS ERROR:", error);

    if (error?.message === "BUSINESS_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to delete business",
    });
  }
}