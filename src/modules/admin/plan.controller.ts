import {
  Request,
  Response,
} from "express";

import {
  createPlan,
  deletePlan,
  getPlanById,
  getPlans,
  updatePlan,
} from "./plan.service";

export async function create(
  req: Request,
  res: Response
) {
  try {
    const {
      name,
      slug,
      description,
      price,
      currency,
      billingInterval,
      maxCustomers,
      maxLeads,
      maxProducts,
      maxKnowledgeItems,
      maxAgents,
      maxChannels,
      maxAiMessages,
      maxAiRequests,
      features,
      status,
      isPopular,
    } = req.body || {};

    if (!name) {
      return res.status(400).json({
        success: false,
        message:
          "name is required",
      });
    }

    if (!slug) {
      return res.status(400).json({
        success: false,
        message:
          "slug is required",
      });
    }

    if (
      price === undefined ||
      price === null
    ) {
      return res.status(400).json({
        success: false,
        message:
          "price is required",
      });
    }

    const plan =
      await createPlan({
        name,
        slug,
        description,
        price: Number(price),
        currency,
        billingInterval,
        maxCustomers,
        maxLeads,
        maxProducts,
        maxKnowledgeItems,
        maxAgents,
        maxChannels,
        maxAiMessages,
        maxAiRequests,
        features,
        status,
        isPopular,
      });

    return res.status(201).json({
      success: true,
      message:
        "Plan created successfully",
      plan,
    });
  } catch (error) {
    console.error(
      "CREATE PLAN ERROR:",
      error
    );

    if (
      error instanceof Error &&
      error.message ===
        "PLAN_SLUG_ALREADY_EXISTS"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Plan slug already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to create plan",
    });
  }
}

export async function list(
  _req: Request,
  res: Response
) {
  try {
    const plans =
      await getPlans();

    return res.status(200).json({
      success: true,
      plans,
    });
  } catch (error) {
    console.error(
      "GET PLANS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to get plans",
    });
  }
}

export async function getOne(
  req: Request,
  res: Response
) {
  try {
    const plan =
      await getPlanById(
        String(req.params.id)
      );

    return res.status(200).json({
      success: true,
      plan,
    });
  } catch (error) {
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

    return res.status(500).json({
      success: false,
      message:
        "Failed to get plan",
    });
  }
}

export async function update(
  req: Request,
  res: Response
) {
  try {
    const plan =
      await updatePlan(
        String(req.params.id),
        req.body || {}
      );

    return res.status(200).json({
      success: true,
      message:
        "Plan updated successfully",
      plan,
    });
  } catch (error) {
    console.error(
      "UPDATE PLAN ERROR:",
      error
    );

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
        "PLAN_SLUG_ALREADY_EXISTS"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Plan slug already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to update plan",
    });
  }
}

export async function remove(
  req: Request,
  res: Response
) {
  try {
    const result =
      await deletePlan(
        String(req.params.id)
      );

    return res.status(200).json({
      ...result,
      message:
        "Plan deleted successfully",
    });
  } catch (error) {
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

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete plan",
    });
  }
}