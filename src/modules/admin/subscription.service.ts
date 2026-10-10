import { randomUUID } from "crypto";
import { sequelize } from "../../config/database";
import Site from "../../models/Site";
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
  siteId: string;
  siteName: string;
  domain: string;
}) {
  const tenant = await Tenant.findByPk(data.tenantId);
  if (!tenant) throw new Error("TENANT_NOT_FOUND");

  const plan = await SubscriptionPlan.findByPk(data.planId);
  if (!plan) throw new Error("PLAN_NOT_FOUND");

  const siteId = data.siteId?.trim().toUpperCase();
  const siteName = data.siteName?.trim();
  const domain = data.domain?.trim().toLowerCase();

  if (!siteId || !siteName || !domain) {
    throw new Error("SITE_DETAILS_REQUIRED");
  }
  if (!/^[A-Z0-9][A-Z0-9_-]{2,49}$/.test(siteId)) {
    throw new Error("INVALID_SITE_ID");
  }

  const startsAt = toValidDate(data.startsAt);
  const expiresAt = toValidDate(data.expiresAt);
  if (expiresAt.getTime() <= startsAt.getTime()) {
    throw new Error("INVALID_SUBSCRIPTION_DATES");
  }

  if (await Site.findOne({ where: { siteId } })) {
    throw new Error("SITE_ID_ALREADY_EXISTS");
  }

  const transaction = await sequelize.transaction();
  try {
    const site = await Site.create({
      id: randomUUID(),
      tenantId: data.tenantId,
      siteId,
      domain,
      name: siteName,
      status: "INSTALLING",
    }, { transaction });

    const subscription = await Subscription.create({
      id: randomUUID(),
      tenantId: data.tenantId,
      planId: data.planId,
      siteId,
      status: data.status || "ACTIVE",
      startsAt,
      expiresAt,
      startedAt: startsAt,
    }, { transaction });

    await transaction.commit();

    const savedSubscription = await Subscription.findByPk(subscription.id, {
      include: [
        { model: SubscriptionPlan, as: "plan" },
        { model: Tenant, as: "tenant" },
      ],
    });

    return {
      subscription: savedSubscription,
      site,
    };
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }
    throw error;
  }
}

export async function getSubscriptions() {
  return Subscription.findAll({
    include: [
      { model: SubscriptionPlan, as: "plan" },
      { model: Tenant, as: "tenant" },
    ],
    order: [["createdAt", "DESC"]],
  });
}

export async function getSubscriptionById(id: string) {
  const subscription = await Subscription.findByPk(id, {
    include: [
      { model: SubscriptionPlan, as: "plan" },
      { model: Tenant, as: "tenant" },
    ],
  });

  if (!subscription) throw new Error("SUBSCRIPTION_NOT_FOUND");
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
  if (!subscription) throw new Error("SUBSCRIPTION_NOT_FOUND");

  if (data.planId !== undefined) {
    const plan = await SubscriptionPlan.findByPk(data.planId);
    if (!plan) throw new Error("PLAN_NOT_FOUND");
    subscription.planId = plan.id;
  }

  if (data.status !== undefined) subscription.status = data.status;
  if (data.startsAt !== undefined) subscription.startsAt = toValidDate(data.startsAt);
  if (data.expiresAt !== undefined) subscription.expiresAt = toValidDate(data.expiresAt);

  if (data.cancelledAt !== undefined) {
    subscription.cancelledAt = data.cancelledAt === null
      ? null
      : toValidDate(data.cancelledAt);
  }

  if (subscription.expiresAt.getTime() <= subscription.startsAt.getTime()) {
    throw new Error("INVALID_SUBSCRIPTION_DATES");
  }

  await subscription.save();
  return getSubscriptionById(subscription.id);
}

export async function deleteSubscription(id: string) {
  const subscription = await Subscription.findByPk(id);
  if (!subscription) throw new Error("SUBSCRIPTION_NOT_FOUND");

  await subscription.destroy();
  return { success: true, id };
}
