import { Op } from "sequelize";
import Site from "../../models/Site";

export async function createSite(data: {
  tenantId: string;
  siteId: string;
  domain: string;
  name: string;
}) {
  const existingSite = await Site.findOne({
    where: {
      siteId: data.siteId,
    },
  });

  if (existingSite) {
    throw new Error("SITE_ID_ALREADY_EXISTS");
  }

  const site = await Site.create({
    tenantId: data.tenantId,
    siteId: data.siteId,
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