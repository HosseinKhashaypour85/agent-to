import { randomUUID } from "crypto";

import SubscriptionPlan from "../../models/SubscriptionPlan";

export async function createPlan(data: {
  name: string;
  slug: string;
  description?: string;
  price: number;
  currency?: string;
  billingInterval?: "MONTHLY" | "YEARLY";

  maxCustomers?: number;
  maxLeads?: number;
  maxProducts?: number;
  maxKnowledgeItems?: number;
  maxAgents?: number;
  maxChannels?: number;

  maxAiMessages?: number;
  maxAiRequests?: number;

  features?: Record<string, unknown>;
  status?: "ACTIVE" | "INACTIVE";
  isPopular?: boolean;
}) {
  const existing =
    await SubscriptionPlan.findOne({
      where: {
        slug: data.slug,
      },
    });

  if (existing) {
    throw new Error(
      "PLAN_SLUG_ALREADY_EXISTS"
    );
  }

  const plan =
    await SubscriptionPlan.create({
      id: randomUUID(),

      name: data.name.trim(),

      slug: data.slug
        .trim()
        .toLowerCase(),

      description:
        data.description?.trim() ||
        null,

      price: data.price,

      currency:
        data.currency || "USD",

      billingInterval:
        data.billingInterval ||
        "MONTHLY",

      maxCustomers:
        data.maxCustomers ?? 100,

      maxLeads:
        data.maxLeads ?? 100,

      maxProducts:
        data.maxProducts ?? 100,

      maxKnowledgeItems:
        data.maxKnowledgeItems ?? 100,

      maxAgents:
        data.maxAgents ?? 1,

      maxChannels:
        data.maxChannels ?? 2,

      maxAiMessages:
        data.maxAiMessages ?? 1000,

      maxAiRequests:
        data.maxAiRequests ?? 1000,

      features:
        data.features || {},

      status:
        data.status || "ACTIVE",

      isPopular:
        data.isPopular ?? false,
    });

  return plan;
}

export async function getPlans() {
  return SubscriptionPlan.findAll({
    order: [
      ["createdAt", "DESC"],
    ],
  });
}

export async function getPlanById(
  id: string
) {
  const plan =
    await SubscriptionPlan.findByPk(
      id
    );

  if (!plan) {
    throw new Error(
      "PLAN_NOT_FOUND"
    );
  }

  return plan;
}

export async function updatePlan(
  id: string,
  data: Partial<{
    name: string;
    slug: string;
    description: string;
    price: number;
    currency: string;
    billingInterval:
      | "MONTHLY"
      | "YEARLY";

    maxCustomers: number;
    maxLeads: number;
    maxProducts: number;
    maxKnowledgeItems: number;
    maxAgents: number;
    maxChannels: number;

    maxAiMessages: number;
    maxAiRequests: number;

    features: Record<
      string,
      unknown
    >;

    status:
      | "ACTIVE"
      | "INACTIVE";

    isPopular: boolean;
  }>
) {
  const plan =
    await getPlanById(id);

  if (
    data.slug &&
    data.slug !== plan.slug
  ) {
    const existing =
      await SubscriptionPlan.findOne({
        where: {
          slug: data.slug,
        },
      });

    if (existing) {
      throw new Error(
        "PLAN_SLUG_ALREADY_EXISTS"
      );
    }
  }

  if (data.name !== undefined) {
    plan.name =
      data.name.trim();
  }

  if (data.slug !== undefined) {
    plan.slug =
      data.slug
        .trim()
        .toLowerCase();
  }

  if (
    data.description !==
    undefined
  ) {
    plan.description =
      data.description.trim();
  }

  if (data.price !== undefined) {
    plan.price =
      data.price;
  }

  if (data.currency !== undefined) {
    plan.currency =
      data.currency;
  }

  if (
    data.billingInterval !==
    undefined
  ) {
    plan.billingInterval =
      data.billingInterval;
  }

  if (
    data.maxCustomers !==
    undefined
  ) {
    plan.maxCustomers =
      data.maxCustomers;
  }

  if (
    data.maxLeads !==
    undefined
  ) {
    plan.maxLeads =
      data.maxLeads;
  }

  if (
    data.maxProducts !==
    undefined
  ) {
    plan.maxProducts =
      data.maxProducts;
  }

  if (
    data.maxKnowledgeItems !==
    undefined
  ) {
    plan.maxKnowledgeItems =
      data.maxKnowledgeItems;
  }

  if (
    data.maxAgents !==
    undefined
  ) {
    plan.maxAgents =
      data.maxAgents;
  }

  if (
    data.maxChannels !==
    undefined
  ) {
    plan.maxChannels =
      data.maxChannels;
  }

  if (
    data.maxAiMessages !==
    undefined
  ) {
    plan.maxAiMessages =
      data.maxAiMessages;
  }

  if (
    data.maxAiRequests !==
    undefined
  ) {
    plan.maxAiRequests =
      data.maxAiRequests;
  }

  if (
    data.features !==
    undefined
  ) {
    plan.features =
      data.features;
  }

  if (
    data.status !==
    undefined
  ) {
    plan.status =
      data.status;
  }

  if (
    data.isPopular !==
    undefined
  ) {
    plan.isPopular =
      data.isPopular;
  }

  await plan.save();

  return plan;
}

export async function deletePlan(
  id: string
) {
  const plan =
    await getPlanById(id);

  await plan.destroy();

  return {
    success: true,
    id,
  };
}