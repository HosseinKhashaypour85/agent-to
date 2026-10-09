import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import Subscription from "../../models/Subscription";
import SubscriptionPlan from "../../models/SubscriptionPlan";

export async function getMySubscription(req: AuthRequest, res: Response) {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(403).json({ success: false, message: "Tenant access required" });
    }

    const subscription = await Subscription.findOne({
      where: { tenantId },
      order: [["createdAt", "DESC"]],
    });

    if (!subscription) {
      return res.status(200).json({ success: true, subscription: null });
    }

    const plan = await SubscriptionPlan.findByPk(subscription.planId);
    return res.status(200).json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        startsAt: subscription.startsAt,
        expiresAt: subscription.expiresAt,
        startedAt: subscription.startedAt,
        cancelledAt: subscription.cancelledAt,
        createdAt: subscription.createdAt,
        plan: plan ? {
          id: plan.id,
          name: plan.name,
          price: plan.price,
          currency: plan.currency,
          billingInterval: plan.billingInterval,
          maxCustomers: plan.maxCustomers,
          maxLeads: plan.maxLeads,
          maxProducts: plan.maxProducts,
          maxAiMessages: plan.maxAiMessages,
        } : null,
      },
    });
  } catch (error) {
    console.error("GET CUSTOMER SUBSCRIPTION ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to get subscription" });
  }
}
