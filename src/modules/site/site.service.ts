import { Op } from "sequelize";
import Site from "../../models/Site";

export async function createSite(data: {
  tenantId: string;
  domain: string;
  name: string;
}) {
  // Site IDs are assigned by the super admin together with a subscription.
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
