import crypto from "crypto";
import Installation from "../../models/Installation";
import Site from "../../models/Site";

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function hashToken(token: string): string {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

export async function generateInstallToken(
  tenantId: string,
  siteId: string
) {
  if (!tenantId) {
    throw new Error("TENANT_ID_REQUIRED");
  }

  if (!siteId) {
    throw new Error("SITE_ID_REQUIRED");
  }

  const site = await Site.findOne({
    where: {
      siteId,
      tenantId,
    },
  });

  if (!site) {
    throw new Error("SITE_NOT_FOUND");
  }

  // لغو توکن‌های قبلی
  await Installation.update(
    {
      status: "REVOKED",
    },
    {
      where: {
        siteId: site.id,
        status: "PENDING",
      },
    }
  );

  const token = generateToken();

  const tokenHash = hashToken(token);

  const expiresAt = new Date(
    Date.now() + 30 * 60 * 1000
  );

  const installation = await Installation.create({
    id: crypto.randomUUID(),
    siteId: site.id,
    tokenHash,
    expiresAt,
    usedAt: null,
    status: "PENDING",
  });

  const installUrl =
    `https://myaiagent.com/install?token=${token}`;

  const installCommand =
    `curl -fsSL "${installUrl}" | bash`;

  return {
    success: true,

    site: {
      id: site.id,
      siteId: site.siteId,
      domain: site.domain,
      name: site.name,
      status: site.status,
    },

    installation: {
      id: installation.id,
      status: installation.status,
      expiresAt: installation.expiresAt,
    },

    token,

    installUrl,

    installCommand,
  };
}