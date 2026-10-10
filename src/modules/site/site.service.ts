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
  // A site and its Site ID must be assigned by a super admin while
  // creating the subscription. Customer requests may only resolve that site.
  const site = await Site.findOne({
    where: {
      tenantId: data.tenantId,
      domain: data.domain.trim().toLowerCase(),
    },
  });

  if (!site) {
    throw new Error("SITE_NOT_ASSIGNED_BY_ADMIN");
  }

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
