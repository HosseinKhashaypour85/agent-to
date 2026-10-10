import {
  Request,
  Response,
} from "express";

import {
  createSubscription,
  deleteSubscription,
  getSubscriptionById,
  getSubscriptions,
  updateSubscription,
} from "./subscription.service";

export async function create(
  req: Request,
  res: Response
) {
  try {
    const {
      tenantId,
      planId,
      status,
      startsAt,
      expiresAt,
      siteId,
      siteName,
      domain,
    } = req.body || {};

    if (!tenantId || !planId || !startsAt || !expiresAt) {
      return res.status(400).json({
        success: false,
        message: "tenantId, planId, startsAt and expiresAt are required",
      });
    }

    if (!siteId || !siteName || !domain) {
      return res.status(400).json({
        success: false,
        code: "SITE_DETAILS_REQUIRED",
        message: "siteId, siteName and domain are required",
      });
    }

    const result = await createSubscription({
      tenantId,
      planId,
      status,
      startsAt: new Date(startsAt),
      expiresAt: new Date(expiresAt),
      siteId,
      siteName,
      domain,
    });

    return res.status(201).json({
      success: true,
      message: "Subscription and site created successfully",
      subscription: result.subscription,
      site: result.site,
    });
  } catch (error) {
    console.error("CREATE SUBSCRIPTION ERROR:", error);

    if (error instanceof Error && error.message === "TENANT_NOT_FOUND") {
      return res.status(404).json({ success: false, message: "Tenant not found" });
    }
    if (error instanceof Error && error.message === "PLAN_NOT_FOUND") {
      return res.status(404).json({ success: false, message: "Plan not found" });
    }
    if (error instanceof Error && error.message === "INVALID_SUBSCRIPTION_DATES") {
      return res.status(400).json({ success: false, message: "expiresAt must be after startsAt" });
    }
    if (error instanceof Error && error.message === "INVALID_SITE_ID") {
      return res.status(400).json({
        success: false,
        code: "INVALID_SITE_ID",
        message: "Site ID must contain 3 to 50 uppercase letters, numbers, underscores or hyphens.",
      });
    }
    if (error instanceof Error && error.message === "SITE_ID_ALREADY_EXISTS") {
      return res.status(409).json({
        success: false,
        code: "SITE_ID_ALREADY_EXISTS",
        message: "This Site ID is already assigned to another site.",
      });
    }
    if (error instanceof Error && error.message === "SITE_DETAILS_REQUIRED") {
      return res.status(400).json({
        success: false,
        code: "SITE_DETAILS_REQUIRED",
        message: "Site ID, site name and domain are required.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create subscription",
    });
  }
}

export async function list(
  _req: Request,
  res: Response
) {
  try {
    const subscriptions =
      await getSubscriptions();

    return res.status(200).json({
      success: true,
      subscriptions,
    });
  } catch (error) {
    console.error(
      "GET SUBSCRIPTIONS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to get subscriptions",
    });
  }
}

export async function getOne(
  req: Request,
  res: Response
) {
  try {
    const subscription =
      await getSubscriptionById(
        String(req.params.id)
      );

    return res.status(200).json({
      success: true,
      subscription,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "SUBSCRIPTION_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Subscription not found",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to get subscription",
    });
  }
}

export async function update(
  req: Request,
  res: Response
) {
  try {
    const subscription =
      await updateSubscription(
        String(req.params.id),
        req.body || {}
      );

    return res.status(200).json({
      success: true,
      message:
        "Subscription updated successfully",
      subscription,
    });
  } catch (error) {
    console.error(
      "UPDATE SUBSCRIPTION ERROR:",
      error
    );

    if (
      error instanceof Error &&
      error.message ===
        "SUBSCRIPTION_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Subscription not found",
      });
    }

    if (
      error instanceof Error &&
      error.message ===
        "PLAN_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Plan not found",
      });
    }

    if (
      error instanceof Error &&
      error.message ===
        "INVALID_SUBSCRIPTION_DATES"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "expiresAt must be after startedAt",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to update subscription",
    });
  }
}

export async function remove(
  req: Request,
  res: Response
) {
  try {
    const result =
      await deleteSubscription(
        String(req.params.id)
      );

    return res.status(200).json({
      ...result,
      message:
        "Subscription deleted successfully",
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "SUBSCRIPTION_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Subscription not found",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete subscription",
    });
  }
}