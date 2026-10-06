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
    } = req.body || {};

    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message:
          "tenantId is required",
      });
    }

    if (!planId) {
      return res.status(400).json({
        success: false,
        message:
          "planId is required",
      });
    }

    if (!startsAt) {
      return res.status(400).json({
        success: false,
        message:
          "startsAt is required",
      });
    }

    if (!expiresAt) {
      return res.status(400).json({
        success: false,
        message:
          "expiresAt is required",
      });
    }

    const subscription =
      await createSubscription({
        tenantId,
        planId,
        status,
        startsAt:
          new Date(startsAt),
        expiresAt:
          new Date(expiresAt),
      });

    return res.status(201).json({
      success: true,
      message:
        "Subscription created successfully",
      subscription,
    });
  } catch (error) {
    console.error(
      "CREATE SUBSCRIPTION ERROR:",
      error
    );

    if (
      error instanceof Error &&
      error.message ===
        "TENANT_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Tenant not found",
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
          "expiresAt must be after startsAt",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to create subscription",
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