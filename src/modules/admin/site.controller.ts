import { Request, Response } from "express";
import Site, { SiteStatus } from "../../models/Site";
import Tenant from "../../models/Tenant";
import Subscription from "../../models/Subscription";
import { createInstallationToken } from "../site/installation.service";

const SITE_STATUSES: SiteStatus[] = ["INSTALLING", "ACTIVE", "INACTIVE"];

export async function listAdminSites(_req: Request, res: Response) {
  try {
    const [sites, tenants, subscriptions] = await Promise.all([
      Site.findAll({ order: [["createdAt", "DESC"]] }),
      Tenant.findAll(),
      Subscription.findAll(),
    ]);

    const tenantNames = new Map(tenants.map((tenant) => [tenant.id, tenant.name]));
    const subscriptionsBySite = new Map(
      subscriptions.filter((item) => item.siteId).map((item) => [item.siteId!, item])
    );

    return res.status(200).json({
      success: true,
      sites: sites.map((site) => {
        const subscription = subscriptionsBySite.get(site.siteId);
        return {
          id: site.id,
          siteId: site.siteId,
          name: site.name,
          domain: site.domain,
          status: site.status,
          tenantId: site.tenantId,
          tenantName: tenantNames.get(site.tenantId) || "نامشخص",
          createdAt: site.createdAt,
          updatedAt: site.updatedAt,
          subscription: subscription ? {
            id: subscription.id,
            status: subscription.status,
            startsAt: subscription.startsAt,
            expiresAt: subscription.expiresAt,
          } : null,
        };
      }),
    });
  } catch (error) {
    console.error("ADMIN LIST SITES ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to load sites" });
  }
}

export async function updateAdminSiteStatus(req: Request, res: Response) {
  try {
    const site = await Site.findByPk(String(req.params.id));
    if (!site) {
      return res.status(404).json({ success: false, message: "Site not found" });
    }

    const status = req.body?.status as SiteStatus;
    if (!SITE_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be INSTALLING, ACTIVE or INACTIVE",
      });
    }

    await site.update({ status });
    return res.status(200).json({
      success: true,
      message: "Site status updated successfully",
      site: {
        id: site.id,
        siteId: site.siteId,
        name: site.name,
        domain: site.domain,
        status: site.status,
      },
    });
  } catch (error) {
    console.error("ADMIN UPDATE SITE STATUS ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to update site status" });
  }
}

export async function createAdminSiteInstallToken(req: Request, res: Response) {
  try {
    const site = await Site.findByPk(String(req.params.id));
    if (!site) {
      return res.status(404).json({ success: false, message: "Site not found" });
    }

    const result = await createInstallationToken(site.id, site.tenantId);
    return res.status(201).json({
      success: true,
      message: "Installation token created successfully",
      siteId: site.siteId,
      domain: site.domain,
      ...result,
    });
  } catch (error) {
    console.error("ADMIN CREATE SITE INSTALL TOKEN ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to create installation token" });
  }
}
