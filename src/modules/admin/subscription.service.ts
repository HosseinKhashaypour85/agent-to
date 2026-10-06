import { randomUUID } from "crypto";

import Subscription from "../../models/Subscription";
import SubscriptionPlan from "../../models/SubscriptionPlan";
import Tenant from "../../models/Tenant";

export async function createSubscription(data: {
  tenantId: string;
  planId: string;

  status?: "ACTIVE" | "EXPIRED" | "SUSPENDED" | "CANCELLED";

  startsAt: Date;
  expiresAt: Date;
}) {
  const tenant =
    await Tenant.findByPk(
      data.tenantId
    );

  if (!tenant) {
    throw new Error(
      "TENANT_NOT_FOUND"
    );
  }

  const plan =
    await SubscriptionPlan.findByPk(
      data.planId
    );

  if (!plan) {
    throw new Error(
      "PLAN_NOT_FOUND"
    );
  }

  if (
    new Date(data.expiresAt).getTime() <=
    new Date(data.startsAt).getTime()
  ) {
    throw new Error(
      "INVALID_SUBSCRIPTION_DATES"
    );
  }

  const subscription =
    await Subscription.create({
      id: randomUUID(),

      tenantId:
        data.tenantId,

      planId:
        data.planId,

      status:
        data.status || "ACTIVE",

      startsAt:
        data.startsAt,

      expiresAt:
        data.expiresAt,
    });

  return Subscription.findByPk(
    subscription.id,
    {
      include: [
        {
          model: SubscriptionPlan,
          as: "plan",
        },
        {
          model: Tenant,
          as: "tenant",
        },
      ],
    }
  );
}

export async function getSubscriptions() {
  return Subscription.findAll({
    include: [
      {
        model: SubscriptionPlan,
        as: "plan",
      },
      {
        model: Tenant,
        as: "tenant",
      },
    ],

    order: [
      ["createdAt", "DESC"],
    ],
  });
}

export async function getSubscriptionById(
  id: string
) {
  const subscription =
    await Subscription.findByPk(
      id,
      {
        include: [
          {
            model: SubscriptionPlan,
            as: "plan",
          },
          {
            model: Tenant,
            as: "tenant",
          },
        ],
      }
    );

  if (!subscription) {
    throw new Error(
      "SUBSCRIPTION_NOT_FOUND"
    );
  }

  return subscription;
}

export async function updateSubscription(
  id: string,
  data: Partial<{
    planId: string;

    status:
      | "ACTIVE"
      | "EXPIRED"
      | "SUSPENDED"
      | "CANCELLED";

    startsAt: Date;

    expiresAt: Date;

    cancelledAt: Date | null;
  }>
) {
  const subscription =
    await Subscription.findByPk(
      id
    );

  if (!subscription) {
    throw new Error(
      "SUBSCRIPTION_NOT_FOUND"
    );
  }

  if (data.planId) {
    const plan =
      await SubscriptionPlan.findByPk(
        data.planId
      );

    if (!plan) {
      throw new Error(
        "PLAN_NOT_FOUND"
      );
    }

    subscription.planId =
      plan.id;
  }

  if (data.status) {
    subscription.status =
      data.status;
  }

  if (data.startsAt) {
    subscription.startsAt =
      data.startsAt;
  }

  if (data.expiresAt) {
    subscription.expiresAt =
      data.expiresAt;
  }

  if (data.cancelledAt !== undefined) {
    subscription.cancelledAt =
      data.cancelledAt;
  }

  if (
    subscription.expiresAt.getTime() <=
    subscription.startsAt.getTime()
  ) {
    throw new Error(
      "INVALID_SUBSCRIPTION_DATES"
    );
  }

  await subscription.save();

  return getSubscriptionById(
    subscription.id
  );
}

export async function deleteSubscription(
  id: string
) {
  const subscription =
    await Subscription.findByPk(
      id
    );

  if (!subscription) {
    throw new Error(
      "SUBSCRIPTION_NOT_FOUND"
    );
  }

  await subscription.destroy();

  return {
    success: true,
    id,
  };
}