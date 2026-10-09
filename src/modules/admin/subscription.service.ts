import { randomUUID } from "crypto";

import Subscription from "../../models/Subscription";
import SubscriptionPlan from "../../models/SubscriptionPlan";
import Tenant from "../../models/Tenant";

type SubscriptionStatus =
  | "ACTIVE"
  | "EXPIRED"
  | "SUSPENDED"
  | "CANCELLED";

function toValidDate(value: Date | string): Date {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error("INVALID_SUBSCRIPTION_DATES");
  }

  return date;
}

export async function createSubscription(data: {
  tenantId: string;
  planId: string;
  status?: SubscriptionStatus;
  startsAt: Date;
  expiresAt: Date;
}) {
  const tenant = await Tenant.findByPk(data.tenantId);

  if (!tenant) {
    throw new Error("TENANT_NOT_FOUND");
  }

  const plan = await SubscriptionPlan.findByPk(data.planId);

  if (!plan) {
    throw new Error("PLAN_NOT_FOUND");
  }

  const startsAt = toValidDate(data.startsAt);
  const expiresAt = toValidDate(data.expiresAt);

  if (expiresAt.getTime() <= startsAt.getTime()) {
    throw new Error("INVALID_SUBSCRIPTION_DATES");
  }

  const subscription = await Subscription.create({
    id: randomUUID(),
    tenantId: data.tenantId,
    planId: data.planId,
    status: data.status || "ACTIVE",
    startsAt,
    expiresAt,
    startedAt: startsAt,
  });

  return Subscription.findByPk(subscription.id, {
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
  });
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
    order: [["createdAt", "DESC"]],
  });
}

export async function getSubscriptionById(id: string) {
  const subscription = await Subscription.findByPk(id, {
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
  });

  if (!subscription) {
    throw new Error("SUBSCRIPTION_NOT_FOUND");
  }

  return subscription;
}

export async function updateSubscription(
  id: string,
  data: Partial<{
    planId: string;
    status: SubscriptionStatus;
    startsAt: Date | string;
    expiresAt: Date | string;
    cancelledAt: Date | string | null;
  }>
) {
  const subscription = await Subscription.findByPk(id);

  if (!subscription) {
    throw new Error("SUBSCRIPTION_NOT_FOUND");
  }

  if (data.planId !== undefined) {
    const plan = await SubscriptionPlan.findByPk(data.planId);

    if (!plan) {
      throw new Error("PLAN_NOT_FOUND");
    }

    subscription.planId = plan.id;
  }

  if (data.status !== undefined) {
    subscription.status = data.status;
  }

  if (data.startsAt !== undefined) {
    subscription.startsAt = toValidDate(data.startsAt);
  }

  if (data.expiresAt !== undefined) {
    subscription.expiresAt = toValidDate(data.expiresAt);
  }

  if (data.cancelledAt !== undefined) {
    subscription.cancelledAt =
      data.cancelledAt === null
        ? null
        : toValidDate(data.cancelledAt);
  }

  if (
    subscription.expiresAt.getTime() <=
    subscription.startsAt.getTime()
  ) {
    throw new Error("INVALID_SUBSCRIPTION_DATES");
  }

  await subscription.save();

  return getSubscriptionById(subscription.id);
}

export async function deleteSubscription(id: string) {
  const subscription = await Subscription.findByPk(id);

  if (!subscription) {
    throw new Error("SUBSCRIPTION_NOT_FOUND");
  }

  await subscription.destroy();

  return {
    success: true,
    id,
  };
}
