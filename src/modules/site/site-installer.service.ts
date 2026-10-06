import crypto from "crypto";

import Site from "../../models/Site";
import Installation from "../../models/Installation";

function hashToken(token: string): string {
  return crypto
    .createHash("sha256")
    .update(token.trim())
    .digest("hex");
}

async function findInstallation(token: string) {
  if (!token?.trim()) {
    throw new Error("INSTALL_TOKEN_REQUIRED");
  }

  const tokenHash = hashToken(token);

  const installation = await Installation.findOne({
    where: {
      tokenHash,
      status: "PENDING",
    },
  });

  if (!installation) {
    throw new Error("INVALID_INSTALL_TOKEN");
  }

  if (
    installation.expiresAt &&
    new Date(installation.expiresAt).getTime() < Date.now()
  ) {
    installation.status = "EXPIRED";

    await installation.save();

    throw new Error("INSTALL_TOKEN_EXPIRED");
  }

  return installation;
}

export async function getInstallInfo(
  token: string
) {
  const installation =
    await findInstallation(token);

  const site =
    await Site.findByPk(
      installation.siteId
    );

  if (!site) {
    throw new Error("SITE_NOT_FOUND");
  }

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
  };
}

export async function getInstallSiteId(
  token: string
): Promise<string> {
  const installation =
    await findInstallation(token);

  const site =
    await Site.findByPk(
      installation.siteId
    );

  if (!site) {
    throw new Error("SITE_NOT_FOUND");
  }

  return site.siteId;
}

export async function installSiteByToken(
  token: string
) {
  const installation =
    await findInstallation(token);

  const site =
    await Site.findByPk(
      installation.siteId
    );

  if (!site) {
    throw new Error("SITE_NOT_FOUND");
  }

  site.status = "ACTIVE";

  await site.save();

  installation.status = "INSTALLED";
  installation.usedAt = new Date();

  await installation.save();

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
      usedAt: installation.usedAt,
    },
  };
}