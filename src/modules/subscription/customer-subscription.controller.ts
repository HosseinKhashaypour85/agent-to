import { Response } from "express";
import { Op } from "sequelize";
import { AuthRequest } from "../../middlewares/auth.middleware";
import Subscription from "../../models/Subscription";
import SubscriptionPlan from "../../models/SubscriptionPlan";
import Site from "../../models/Site";

export async function getMySubscriptions(req: AuthRequest, res: Response) {
  try {
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return res.status(403).json({
        success: false,
        message: "Tenant access required",
      });
    }

    const subscriptions = await Subscription.findAll({
      where: { tenantId },
      include: [{ model: SubscriptionPlan, as: "plan" }],
      order: [["createdAt", "DESC"]],
    });

    const siteIds = subscriptions
      .map((subscription) => subscription.siteId)
      .filter((siteId): siteId is string => Boolean(siteId));

    const sites = siteIds.length
      ? await Site.findAll({
          where: {
            tenantId,
            siteId: { [Op.in]: siteIds },
          },
        })
      : [];

    const sitesById = new Map(sites.map((site) => [site.siteId, site.toJSON()]));
    const now = Date.now();

    const data = subscriptions.map((subscription) => {
      const item = subscription.toJSON() as Record<string, any>;
      const startsAt = new Date(item.startsAt).getTime();
      const expiresAt = new Date(item.expiresAt).getTime();
      let effectiveStatus = item.status;

      if (item.status === "ACTIVE" && expiresAt < now) {
        effectiveStatus = "EXPIRED";
      } else if (item.status === "ACTIVE" && startsAt > now) {
        effectiveStatus = "SCHEDULED";
      }

      return {
        ...item,
        effectiveStatus,
        site: item.siteId ? sitesById.get(item.siteId) ?? null : null,
      };
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("GET MY SUBSCRIPTIONS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get your subscriptions",
    });
  }
}
