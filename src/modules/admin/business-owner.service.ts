import { randomUUID } from "crypto";

import Tenant from "../../models/Tenant";
import User from "../../models/User";
import BusinessOwner from "../../models/BusinessOwner";

export async function getBusinessOwner(tenantId: string) {
  const owner = await BusinessOwner.findOne({
    where: {
      tenantId,
    },
  });

  if (!owner) {
    return null;
  }

  const user = await User.findByPk(owner.userId, {
    attributes: [
      "id",
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

  if (!user) {
    return null;
  }

  return {
    id: owner.id,
    tenantId: owner.tenantId,
    user,
    createdAt: owner.createdAt,
    updatedAt: owner.updatedAt,
  };
}

export async function assignBusinessOwner(
  tenantId: string,
  userId: string
) {
  const business = await Tenant.findByPk(tenantId);

  if (!business) {
    throw new Error("BUSINESS_NOT_FOUND");
  }

  const user = await User.findByPk(userId);

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  if (user.tenantId !== tenantId) {
    throw new Error("USER_NOT_IN_BUSINESS");
  }

  if (user.role !== "ADMIN") {
    throw new Error("OWNER_MUST_BE_ADMIN");
  }

  const existingOwner = await BusinessOwner.findOne({
    where: {
      tenantId,
    },
  });

  if (existingOwner) {
    existingOwner.userId = userId;

    await existingOwner.save();

    return getBusinessOwner(tenantId);
  }

  const owner = await BusinessOwner.create({
    id: randomUUID(),
    tenantId,
    userId,
  });

  return getBusinessOwner(tenantId);
}

export async function removeBusinessOwner(
  tenantId: string
) {
  const owner = await BusinessOwner.findOne({
    where: {
      tenantId,
    },
  });

  if (!owner) {
    throw new Error("BUSINESS_OWNER_NOT_FOUND");
  }

  await owner.destroy();

  return {
    success: true,
    message: "Business owner removed successfully",
  };
}