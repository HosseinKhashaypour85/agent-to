import { Request, Response } from "express";

import {
  getInstallInfo,
  getInstallSiteId,
  installSiteByToken,
} from "./site-installer.service";

function getToken(req: Request): string {
  const queryToken =
    typeof req.query.token === "string"
      ? req.query.token
      : "";

  const bodyToken =
    typeof req.body?.token === "string"
      ? req.body.token
      : "";

  return bodyToken.trim() || queryToken.trim();
}

export async function getInstallInfoController(
  req: Request,
  res: Response
) {
  try {
    const token = getToken(req);

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Install token is required",
      });
    }

    const result = await getInstallInfo(token);

    return res.status(200).json(result);
  } catch (error) {
    console.error("INSTALL INFO ERROR:", error);

    if (
      error instanceof Error &&
      error.message === "INVALID_INSTALL_TOKEN"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid install token",
      });
    }

    if (
      error instanceof Error &&
      error.message === "INSTALL_TOKEN_EXPIRED"
    ) {
      return res.status(410).json({
        success: false,
        message: "Install token has expired",
      });
    }

    if (
      error instanceof Error &&
      error.message === "SITE_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Site not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to get install info",
    });
  }
}

export async function getInstallSiteIdController(
  req: Request,
  res: Response
) {
  try {
    const token = getToken(req);

    if (!token) {
      return res
        .status(400)
        .type("text")
        .send("INSTALL_TOKEN_REQUIRED");
    }

    const siteId = await getInstallSiteId(token);

    return res
      .status(200)
      .type("text")
      .send(siteId);
  } catch (error) {
    console.error("INSTALL SITE ID ERROR:", error);

    if (
      error instanceof Error &&
      error.message === "INVALID_INSTALL_TOKEN"
    ) {
      return res
        .status(401)
        .type("text")
        .send("INVALID_INSTALL_TOKEN");
    }

    if (
      error instanceof Error &&
      error.message === "INSTALL_TOKEN_EXPIRED"
    ) {
      return res
        .status(410)
        .type("text")
        .send("INSTALL_TOKEN_EXPIRED");
    }

    if (
      error instanceof Error &&
      error.message === "SITE_NOT_FOUND"
    ) {
      return res
        .status(404)
        .type("text")
        .send("SITE_NOT_FOUND");
    }

    return res
      .status(500)
      .type("text")
      .send("INSTALL_SITE_ID_ERROR");
  }
}

export async function installSite(
  req: Request,
  res: Response
) {
  try {
    const token = getToken(req);

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Install token is required",
      });
    }

    const result = await installSiteByToken(token);

    return res.status(200).json(result);
  } catch (error) {
    console.error("INSTALL ERROR:", error);

    if (
      error instanceof Error &&
      error.message === "INVALID_INSTALL_TOKEN"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid install token",
      });
    }

    if (
      error instanceof Error &&
      error.message === "INSTALL_TOKEN_EXPIRED"
    ) {
      return res.status(410).json({
        success: false,
        message: "Install token has expired",
      });
    }

    if (
      error instanceof Error &&
      error.message === "SITE_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Site not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Installation failed",
    });
  }
}