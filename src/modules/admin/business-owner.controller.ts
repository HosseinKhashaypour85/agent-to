import { Request, Response } from "express";

import {
  assignBusinessOwner,
  getBusinessOwner,
  removeBusinessOwner,
} from "./business-owner.service";

export async function getBusinessOwnerController(
  req: Request,
  res: Response
) {
  try {
    const owner = await getBusinessOwner(String(req.params.id));

    return res.status(200).json({
      success: true,
      data: owner,
    });
  } catch (error) {
    console.error("GET BUSINESS OWNER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get business owner",
    });
  }
}

export async function assignBusinessOwnerController(
  req: Request,
  res: Response
) {
  try {
    const { userId } = req.body || {};

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const owner = await assignBusinessOwner(
      String(req.params.id),
      userId
    );

    return res.status(200).json({
      success: true,
      message: "Business owner assigned successfully",
      data: owner,
    });
  } catch (error: any) {
    console.error("ASSIGN BUSINESS OWNER ERROR:", error);

    switch (error?.message) {
      case "BUSINESS_NOT_FOUND":
        return res.status(404).json({
          success: false,
          message: "Business not found",
        });

      case "USER_NOT_FOUND":
        return res.status(404).json({
          success: false,
          message: "User not found",
        });

      case "USER_NOT_IN_BUSINESS":
        return res.status(400).json({
          success: false,
          message:
            "User does not belong to this business",
        });

      case "OWNER_MUST_BE_ADMIN":
        return res.status(400).json({
          success: false,
          message:
            "Business owner must have ADMIN role",
        });

      default:
        return res.status(500).json({
          success: false,
          message: "Failed to assign business owner",
        });
    }
  }
}

export async function removeBusinessOwnerController(
  req: Request,
  res: Response
) {
  try {
    const result = await removeBusinessOwner(
      String(req.params.id)
    );

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("REMOVE BUSINESS OWNER ERROR:", error);

    if (
      error?.message === "BUSINESS_OWNER_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Business owner not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to remove business owner",
    });
  }
}