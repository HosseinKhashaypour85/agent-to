import { Request, Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";

import {
  createSite,
  getSites,
  getSite,
} from "./site.service";

import {
  createInstallationToken,
  installByToken,
  validateInstallationToken,
} from "./installation.service";

export async function create(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { domain, name } = req.body || {};

    if (
      typeof domain !== "string" ||
      !domain.trim() ||
      typeof name !== "string" ||
      !name.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "domain and name are required",
      });
    }

    const site = await createSite({
      tenantId: req.user.tenantId,
      domain: domain.trim(),
      name: name.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Site created successfully",
      data: site,
    });
  } catch (error: any) {
    if (error?.message === "SUBSCRIPTION_REQUIRED") {
      return res.status(402).json({
        success: false,
        code: "SUBSCRIPTION_REQUIRED",
        message: "An active subscription is required before creating a site",
      });
    }

    if (error?.message === "SITE_NOT_ASSIGNED_BY_ADMIN") {
      return res.status(403).json({
        success: false,
        code: "SITE_NOT_ASSIGNED_BY_ADMIN",
        message: "A site must be assigned by the super admin when the subscription is created.",
      });
    }

    console.error("CREATE SITE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function list(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const sites = await getSites(req.user.tenantId);

    return res.status(200).json({
      success: true,
      data: sites,
    });
  } catch (error) {
    console.error("LIST SITES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getSiteById(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const idOrSiteId = String(req.params.id);
    const site = await getSite(idOrSiteId, req.user.tenantId);

    return res.status(200).json({
      success: true,
      data: site,
    });
  } catch (error: any) {
    if (error?.message === "SITE_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Site not found",
      });
    }

    console.error("GET SITE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function createInstallToken(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const id = String(req.params.id);
    const result = await createInstallationToken(id, req.user.tenantId);

    return res.status(201).json({
      success: true,
      message: "Installation token created successfully",
      data: result,
    });
  } catch (error: any) {
    if (error?.message === "SITE_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Site not found",
      });
    }

    console.error("CREATE INSTALL TOKEN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function install(req: Request, res: Response) {
  try {
    const { token } = req.body || {};

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Installation token is required",
      });
    }

    const result = await installByToken(token);

    return res.status(200).json({
      success: true,
      message: "Installation completed successfully",
      data: result,
    });
  } catch (error: any) {
    switch (error.message) {
      case "TOKEN_REQUIRED":
        return res.status(400).json({
          success: false,
          message: "Installation token is required",
        });
      case "INVALID_INSTALLATION_TOKEN":
        return res.status(401).json({
          success: false,
          message: "Invalid installation token",
        });
      case "INSTALLATION_TOKEN_ALREADY_USED":
        return res.status(409).json({
          success: false,
          message: "Installation token has already been used",
        });
      case "INSTALLATION_TOKEN_EXPIRED":
        return res.status(410).json({
          success: false,
          message: "Installation token has expired",
        });
      case "SITE_NOT_FOUND":
        return res.status(404).json({
          success: false,
          message: "Site not found",
        });
      default:
        console.error("INSTALL SITE ERROR:", error);
        return res.status(500).json({
          success: false,
          message: "Internal server error",
        });
    }
  }
}

export async function getInstallScript(req: Request, res: Response) {
  try {
    const token = String(req.query.token || "");

    if (!token) {
      return res.status(400).send("Installation token is required");
    }

    const result = await validateInstallationToken(token);
    const site = result.site;
    const apiUrl = process.env.PUBLIC_API_URL || "http://localhost:3000";

    const script = `#!/usr/bin/env bash

set -e

echo "======================================"
echo "       MY AI AGENT INSTALLER"
echo "======================================"
echo ""

SITE_ID="${site.siteId}"
DOMAIN="${site.domain}"
TOKEN="${token}"
API_URL="${apiUrl}"

echo "Installing AI Agent..."
echo "Site ID: $SITE_ID"
echo "Domain: $DOMAIN"
echo ""

mkdir -p public_html/ai-agent

cat > public_html/ai-agent/config.json <<EOF
{
  "siteId": "$SITE_ID",
  "domain": "$DOMAIN"
}
EOF

echo "Connector files created."

curl -fsS -X POST "$API_URL/api/v1/sites/install" \\
  -H "Content-Type: application/json" \\
  -d "{\\"token\\":\\"$TOKEN\\"}" > /tmp/my-ai-agent-install.json

echo ""
echo "Installation response:"
cat /tmp/my-ai-agent-install.json

echo ""
echo "======================================"
echo "AI Agent installation completed."
echo "======================================"
`;

    return res.status(200).type("text/plain").send(script);
  } catch (error: any) {
    switch (error.message) {
      case "TOKEN_REQUIRED":
        return res.status(400).send("Installation token is required");
      case "INVALID_INSTALLATION_TOKEN":
        return res.status(401).send("Invalid installation token");
      case "INSTALLATION_TOKEN_ALREADY_USED":
        return res.status(409).send("Installation token has already been used");
      case "INSTALLATION_TOKEN_EXPIRED":
        return res.status(410).send("Installation token has expired");
      case "SITE_NOT_FOUND":
        return res.status(404).send("Site not found");
      default:
        console.error("GET INSTALL SCRIPT ERROR:", error);
        return res.status(500).send("Internal server error");
    }
  }
}
