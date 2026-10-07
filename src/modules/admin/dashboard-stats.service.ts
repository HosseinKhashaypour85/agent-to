import Tenant from "../../models/Tenant";
import User from "../../models/User";
import Agent from "../../models/Agent";
import Subscription from "../../models/Subscription";
import SubscriptionPlan from "../../models/SubscriptionPlan";
import Site from "../../models/Site";
import Customer from "../../models/Customer";
import Lead from "../../models/Lead";
import Conversation from "../../models/Conversation";
import Product from "../../models/Product";
import KnowledgeBase from "../../models/KnowledgeBase";
import LeadScore from "../../models/LeadScore";

const EXPIRING_SOON_DAYS = 7;

type SubscriptionWithPlan = Subscription & {
  plan?: SubscriptionPlan;
};

function toNumber(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function persianMonthLabel(date: Date): string {
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      month: "long",
    }).format(date);
  } catch {
    return date.toLocaleDateString("en-US", {
      month: "long",
    });
  }
}

function countByStatus(
  items: Array<{ status: string }>,
  status: string
): number {
  return items.filter((item) => item.status === status).length;
}

export async function getDashboardStats() {
  const [
    businesses,
    subscriptions,
    usersTotal,
    agents,
    plans,
    sitesTotal,
    customersTotal,
    leadsTotal,
    conversationsTotal,
    productsTotal,
    knowledgeItemsTotal,
    hotLeads,
    warmLeads,
    coldLeads,
  ] = await Promise.all([
    Tenant.findAll({
      order: [["createdAt", "DESC"]],
    }),

    Subscription.findAll({
      include: [
        {
          model: SubscriptionPlan,
          as: "plan",
        },
      ],
      order: [["createdAt", "DESC"]],
    }) as unknown as Promise<SubscriptionWithPlan[]>,

    User.count(),

    Agent.findAll(),

    SubscriptionPlan.findAll(),

    Site.count(),
    Customer.count(),
    Lead.count(),
    Conversation.count(),
    Product.count(),
    KnowledgeBase.count(),

    LeadScore.count({
      where: {
        temperature: "HOT",
      },
    }),

    LeadScore.count({
      where: {
        temperature: "WARM",
      },
    }),

    LeadScore.count({
      where: {
        temperature: "COLD",
      },
    }),
  ]);

  const businessesStats = {
    total: businesses.length,
    active: countByStatus(businesses, "ACTIVE"),
    suspended: countByStatus(businesses, "SUSPENDED"),
    deactivated: countByStatus(businesses, "DEACTIVATED"),
    recent: businesses.slice(0, 5).map((business) => ({
      id: business.id,
      name: business.name,
      slug: business.slug,
      status: business.status,
      createdAt: business.createdAt,
    })),
  };

  const subscriptionsStats = {
    total: subscriptions.length,
    active: countByStatus(subscriptions, "ACTIVE"),
    expired: countByStatus(subscriptions, "EXPIRED"),
    suspended: countByStatus(subscriptions, "SUSPENDED"),
    cancelled: countByStatus(subscriptions, "CANCELLED"),
    recent: subscriptions.slice(0, 5).map((subscription) => ({
      id: subscription.id,
      status: subscription.status,
      planName: subscription.plan?.name || null,
      createdAt: subscription.createdAt,
    })),
  };

  const now = new Date();
  const buckets: Array<{
    key: string;
    label: string;
    total: number;
  }> = [];

  for (let i = 11; i >= 0; i--) {
    const ref = new Date(
      now.getFullYear(),
      now.getMonth() - i,
      1
    );

    buckets.push({
      key: monthKey(ref),
      label: persianMonthLabel(ref),
      total: 0,
    });
  }

  const bucketMap = new Map(
    buckets.map((bucket) => [bucket.key, bucket])
  );

  for (const subscription of subscriptions) {
    const startsAt = new Date(subscription.startsAt);
    const bucket = bucketMap.get(monthKey(startsAt));

    if (bucket) {
      bucket.total += toNumber(subscription.plan?.price);
    }
  }

  const monthlyRevenue = buckets.map(({ label, total }) => ({
    month: label,
    total,
  }));

  const usageByPlanId = new Map<string, number>();

  for (const subscription of subscriptions) {
    usageByPlanId.set(
      subscription.planId,
      (usageByPlanId.get(subscription.planId) || 0) + 1
    );
  }

  const plansWithUsage = plans.map((plan) => ({
    id: plan.id,
    name: plan.name,
    slug: plan.slug,
    price: toNumber(plan.price),
    currency: plan.currency,
    billingInterval: plan.billingInterval,
    isPopular: plan.isPopular,
    status: plan.status,
    subscriptionCount: usageByPlanId.get(plan.id) || 0,
  }));

  const popularPlans = plansWithUsage
    .filter(
      (plan) =>
        plan.isPopular || plan.subscriptionCount > 0
    )
    .sort((a, b) => b.subscriptionCount - a.subscriptionCount)
    .slice(0, 3);

  const activity = [
    ...businessesStats.recent.map((business) => ({
      id: `business-${business.id}`,
      type: "business" as const,
      title: "کسب‌وکار جدید ایجاد شد",
      subject: business.name,
      at: business.createdAt,
    })),

    ...subscriptionsStats.recent.map((subscription) => ({
      id: `subscription-${subscription.id}`,
      type: "subscription" as const,
      title: "اشتراک جدید ثبت شد",
      subject: subscription.planName || "—",
      at: subscription.createdAt,
    })),
  ]
    .sort(
      (a, b) =>
        new Date(b.at).getTime() - new Date(a.at).getTime()
    )
    .slice(0, 6);

  const expiringSoonLimit = new Date(
    now.getTime() +
      EXPIRING_SOON_DAYS * 24 * 60 * 60 * 1000
  );

  const expiringSoon = subscriptions.filter(
    (subscription) =>
      subscription.status === "ACTIVE" &&
      subscription.expiresAt &&
      new Date(subscription.expiresAt).getTime() <=
        expiringSoonLimit.getTime()
  ).length;

  return {
    businesses: businessesStats,
    subscriptions: subscriptionsStats,
    users: {
      total: usersTotal,
    },
    agents: {
      total: agents.length,
      active: agents.filter(
        (agent) => agent.isActive === true
      ).length,
    },
    counts: {
      sites: sitesTotal,
      customers: customersTotal,
      leads: leadsTotal,
      conversations: conversationsTotal,
      products: productsTotal,
      knowledgeItems: knowledgeItemsTotal,
    },
    monthlyRevenue,
    popularPlans,
    leadTemperatures: {
      hot: hotLeads,
      warm: warmLeads,
      cold: coldLeads,
    },
    activity,
    attention: {
      suspendedBusinesses: businessesStats.suspended,
      expiredSubscriptions: subscriptionsStats.expired,
      expiringSoonSubscriptions: expiringSoon,
    },
  };
}
