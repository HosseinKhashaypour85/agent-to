import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";

import Customer from "../../models/Customer";

import {
  calculateLeadScore,
  getLeadScore,
  getLeadsByTemperature,
  getTopHotLeads,
  getLeadScoreStats,
  getRecommendation,
  getTemperatureLabel,
} from "./lead-scoring.service";

type LeadScoreWithCustomer = Awaited<ReturnType<typeof getLeadsByTemperature>>[0] & {
  customer?: Customer;
};

export async function calculateLeadScoreController(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { customerId, leadId } = req.body || {};

    if (!customerId) {
      return res.status(400).json({ success: false, message: "customerId is required" });
    }

    const result = await calculateLeadScore({
      tenantId: req.user.tenantId,
      customerId,
      leadId,
      triggerEvent: "manual",
    });

    return res.status(200).json({
      success: true,
      data: {
        ...result,
        temperatureLabel: getTemperatureLabel(result.temperature),
        recommendation: getRecommendation(result.temperature, result.score),
      },
    });
  } catch (error: any) {
    if (error.message === "CUSTOMER_NOT_FOUND") {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function getLeadScoreController(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const customerId = String(req.params.customerId);
    const result = await getLeadScore(req.user.tenantId, customerId);

    if (!result) {
      return res.status(404).json({ success: false, message: "Lead score not found" });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...result,
        temperatureLabel: getTemperatureLabel(result.temperature),
        recommendation: getRecommendation(result.temperature, result.score),
      },
    });
  } catch (error: any) {
    if (error.message === "CUSTOMER_NOT_FOUND") {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function getLeadsByTemperatureController(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const temperature = String(req.query.temperature || "HOT");
    if (!["HOT", "WARM", "COLD"].includes(temperature)) {
      return res.status(400).json({ success: false, message: "Invalid temperature" });
    }

    const leads = await getLeadsByTemperature(req.user.tenantId, temperature as "HOT" | "WARM" | "COLD");

    return res.status(200).json({
      success: true,
      data: leads.map((ls: LeadScoreWithCustomer) => ({
        score: ls.score,
        temperature: ls.temperature,
        temperatureLabel: getTemperatureLabel(ls.temperature),
        reasons: ls.reasons,
        customer: ls.customer,
        lastCalculatedAt: ls.lastCalculatedAt,
      })),
    });
  } catch (error: any) {
    console.error("getLeadsByTemperatureController error:", error?.message, error?.stack, error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function getDashboardLeadStatsController(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const stats = await getLeadScoreStats(req.user.tenantId);

    return res.status(200).json({
      success: true,
      data: {
        hot: stats.hot,
        warm: stats.warm,
        cold: stats.cold,
        topHot: stats.topHot.map((ls: LeadScoreWithCustomer) => ({
          id: ls.customer?.id,
          name: `${ls.customer?.firstName || ""} ${ls.customer?.lastName || ""}`.trim(),
          score: ls.score,
          temperature: ls.temperature,
          temperatureLabel: getTemperatureLabel(ls.temperature),
          phone: ls.customer?.phone,
          email: ls.customer?.email,
        })),
      },
    });
  } catch (error: any) {
    console.error("getDashboardLeadStatsController error:", error?.message, error?.stack, error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}