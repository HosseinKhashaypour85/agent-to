import Tenant from "../../models/Tenant";
import User from "../../models/User";
import BusinessOwner from "../../models/BusinessOwner";
import Subscription from "../../models/Subscription";
import SubscriptionPlan from "../../models/SubscriptionPlan";

import Site from "../../models/Site";
import Customer from "../../models/Customer";
import Lead from "../../models/Lead";
import Conversation from "../../models/Conversation";
import Product from "../../models/Product";
import KnowledgeBase from "../../models/KnowledgeBase";
import Agent from "../../models/Agent";

export async function getBusinessOverview(tenantId: string) {
  const business = await Tenant.findByPk(tenantId);

  if (!business) {
    throw new Error("BUSINESS_NOT_FOUND");
  }

  const ownerRelation = await BusinessOwner.findOne({
    where: {
      tenantId,
    },
  });

  let owner = null;

  if (ownerRelation) {
    owner = await User.findByPk(ownerRelation.userId, {
      attributes: [
        "id",
        "tenantId",
        "email",
        "firstName",
        "lastName",
        "role",
        "isEmailVerified",
        "lastLogin",
        "createdAt",
        "updatedAt",
      ],
    });
  }

  const teamMembers = await User.count({
    where: {
      tenantId,
    },
  });

  const subscription = await Subscription.findOne({
    where: {
      tenantId,
    },
    include: [
      {
        model: SubscriptionPlan,
        as: "plan",
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  const [
    sites,
    customers,
    leads,
    conversations,
    products,
    knowledgeItems,
    agents,
  ] = await Promise.all([
    Site.count({
      where: {
        tenantId,
      },
    }),

    Customer.count({
      where: {
        tenantId,
      },
    }),

    Lead.count({
      where: {
        tenantId,
      },
    }),

    Conversation.count({
      where: {
        tenantId,
      },
    }),

    Product.count({
      where: {
        tenantId,
      },
    }),

    KnowledgeBase.count({
      where: {
        tenantId,
      },
    }),

    Agent.count({
      where: {
        tenantId,
      },
    }),
  ]);

  return {
    business: {
      id: business.id,
      name: business.name,
      slug: business.slug,
      email: business.email,
      phone: business.phone,
      status: business.status,
      createdAt: business.createdAt,
      updatedAt: business.updatedAt,
    },

    owner,

    team: {
      total: teamMembers,
    },

    subscription,

    statistics: {
      sites,
      customers,
      leads,
      conversations,
      products,
      knowledgeItems,
      agents,
    },
  };
}