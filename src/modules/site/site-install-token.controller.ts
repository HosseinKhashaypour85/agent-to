import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import {
  generateInstallToken,
} from "./site-install-token.service";

export async function createInstallToken(
  req: AuthRequest,
  res: Response
) {
  try {
    const tenantId = req.user?.tenantId;

    const { siteId } = req.body;

    if (!tenantId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!siteId) {
      return res.status(400).json({
        success: false,
        message: "siteId is required",
      });
    }

    const result =
      await generateInstallToken(
        tenantId,
        siteId
      );

    return res.status(201).json(result);
  } catch (error) {
    console.error(
      "CREATE INSTALL TOKEN ERROR:",
      error
    );

    if (
      error instanceof Error &&
      error.message === "SITE_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Site not found",
      });
    }

    if (
      error instanceof Error &&
      error.message === "SITE_ID_REQUIRED"
    ) {
      return res.status(400).json({
        success: false,
        message: "siteId is required",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to generate install token",
    });
  }
}