import crypto from "crypto";
import Installation from "../../models/Installation";
import Site from "../../models/Site";

export async function createInstallationToken(
  siteId: string,
  tenantId: string
) {
  const site = await Site.findOne({
    where: {
      id: siteId,
      tenantId,
    },
  });

  if (!site) {
    throw new Error("SITE_NOT_FOUND");
  }

  // غیرفعال کردن Tokenهای قبلی
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

  // ساخت Token امن
  const rawToken = crypto.randomBytes(32).toString("hex");

  // Hash کردن Token
  const tokenHash = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  // Token به مدت 30 دقیقه معتبر است
  const expiresAt = new Date(
    Date.now() + 30 * 60 * 1000
  );

  const installation = await Installation.create({
    siteId: site.id,
    tokenHash,
    expiresAt,
    status: "PENDING",
    usedAt: null,
  });

  return {
    installationId: installation.id,
    token: rawToken,
    expiresAt,
  };
}

export async function installByToken(rawToken: string) {
  if (!rawToken) {
    throw new Error("TOKEN_REQUIRED");
  }

  // Hash the raw token
  const tokenHash = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  // Find installation
  const installation = await Installation.findOne({
    where: {
      tokenHash,
    },
  });

  if (!installation) {
    throw new Error("INVALID_INSTALLATION_TOKEN");
  }

  // Check status
  if (installation.status !== "PENDING") {
    throw new Error("INSTALLATION_TOKEN_ALREADY_USED");
  }

  // Check expiration
  if (installation.expiresAt.getTime() < Date.now()) {
    await installation.update({
      status: "EXPIRED",
    });

    throw new Error("INSTALLATION_TOKEN_EXPIRED");
  }

  // Find site
  const site = await Site.findByPk(installation.siteId);

  if (!site) {
    throw new Error("SITE_NOT_FOUND");
  }

  // Mark installation as installed
  await installation.update({
    status: "INSTALLED",
    usedAt: new Date(),
  });

  // Activate site
  await site.update({
    status: "ACTIVE",
  });

  return {
    installationId: installation.id,
    siteId: site.siteId,
    domain: site.domain,
    name: site.name,
    status: site.status,
  };
}

export async function validateInstallationToken(rawToken: string) {
  if (!rawToken) {
    throw new Error("TOKEN_REQUIRED");
  }

  const tokenHash = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  const installation = await Installation.findOne({
    where: {
      tokenHash,
    },
  });

  if (!installation) {
    throw new Error("INVALID_INSTALLATION_TOKEN");
  }

  if (installation.status !== "PENDING") {
    throw new Error("INSTALLATION_TOKEN_ALREADY_USED");
  }

  if (installation.expiresAt.getTime() < Date.now()) {
    await installation.update({
      status: "EXPIRED",
    });

    throw new Error("INSTALLATION_TOKEN_EXPIRED");
  }

  const site = await Site.findByPk(installation.siteId);

  if (!site) {
    throw new Error("SITE_NOT_FOUND");
  }

  return {
    installation,
    site,
  };
}