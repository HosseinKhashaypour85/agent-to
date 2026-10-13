import { Request, Response } from "express";
import SubscriptionPlan from "../../models/SubscriptionPlan";

export async function listPublicPlans(_req: Request, res: Response) {
  try {
    const plans = await SubscriptionPlan.findAll({
      where: { status: "ACTIVE" },
      attributes: [
        "id", "name", "slug", "description", "price", "currency",
        "billingInterval", "maxCustomers", "maxLeads", "maxProducts",
        "maxKnowledgeItems", "maxAgents", "maxChannels", "maxAiMessages",
        "maxAiRequests", "features", "isPopular",
      ],
      order: [["createdAt", "ASC"]],
    });

    return res.status(200).json({ success: true, plans });
  } catch (error) {
    console.error("PUBLIC PLANS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load plans",
    });
  }
}
