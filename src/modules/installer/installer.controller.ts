import { Request, Response } from "express";
import {
  generateInstallerScript,
} from "./installer.service";

export function getInstallerScript(
  req: Request,
  res: Response
) {
  try {
    const token =
      typeof req.query.token === "string"
        ? req.query.token.trim()
        : "";

    if (!token) {
      return res.status(400).send(
        "# ERROR: Install token is required\n"
      );
    }

    const script =
      generateInstallerScript(token);

    res.setHeader(
      "Content-Type",
      "text/plain; charset=utf-8"
    );

    res.setHeader(
      "Content-Disposition",
      'inline; filename="install.sh"'
    );

    return res.status(200).send(script);
  } catch (error) {
    console.error(
      "INSTALLER SCRIPT ERROR:",
      error
    );

    if (
      error instanceof Error &&
      error.message ===
        "INSTALL_TOKEN_REQUIRED"
    ) {
      return res.status(400).send(
        "# ERROR: Install token is required\n"
      );
    }

    return res.status(500).send(
      "# ERROR: Failed to generate installer\n"
    );
  }
}