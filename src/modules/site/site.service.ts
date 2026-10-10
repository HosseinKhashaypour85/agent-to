import { randomBytes } from "crypto";
import { Op } from "sequelize";
import Site from "../../models/Site";
import Subscription from "../../models/Subscription";

function generateSiteId(): string {
  return `AT-${randomBytes(6).toString("hex").toUpperCase()}`;
}

export async function createSite(data: {
  tenantId: string;
  domain: string;
  name: string;
}) {
  const now = new Date();

  const activeSubscription = await Subscription.findOne({
    where: {
      tenantId: data.tenantId,
      status: "ACTIVE",
      startsAt: { [Op.lte]: now },
      expiresAt: { [Op.gt]: now },
    },
  });

  if (!activeSubscription) {
    throw new Error("SUBSCRIPTION_REQUIRED");
  }

  // Site IDs are generated centrally; customers must not invent or reuse them.
  let siteId = generateSiteId();
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const existingSite = await Site.findOne({ where: { siteId } });
    if (!existingSite) break;
    siteId = generateSiteId();
  }

  const finalCollision = await Site.findOne({ where: { siteId } });
  if (finalCollision) {
    throw new Error("SITE_ID_GENERATION_FAILED");
  }

  const site = await Site.create({
    tenantId: data.tenantId,
    siteId,
    domain: data.domain,
    name: data.name,
    status: "INSTALLING",
  });

  return site;
}

export async function getSites(tenantId: string) {
  return Site.findAll({
    where: {
      tenantId,
    },
    order: [["createdAt", "DESC"]],
  });
}

export async function getSite(idOrSiteId: string, tenantId: string) {
  const site = await Site.findOne({
    where: {
      tenantId,
      [Op.or]: [
        { id: idOrSiteId },
        { siteId: idOrSiteId },
      ],
    },
  });

  if (!site) {
    throw new Error("SITE_NOT_FOUND");
  }

  return site;
}
