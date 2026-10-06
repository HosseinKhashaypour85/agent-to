import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

import User from "../../models/User";
import Tenant from "../../models/Tenant";
import BusinessOwner from "../../models/BusinessOwner";

interface CreateBusinessUserInput {
  email: string;
  password: string;
  firstName?: string | null;
  lastName?: string | null;
  role?: "ADMIN" | "STAFF";
  isEmailVerified?: boolean;
}

interface UpdateBusinessUserInput {
  email?: string;
  password?: string;
  firstName?: string | null;
  lastName?: string | null;
  role?: "ADMIN" | "STAFF";
  isEmailVerified?: boolean;
}

const USER_ATTRIBUTES = [
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
];

async function getBusiness(tenantId: string) {
  const business = await Tenant.findByPk(tenantId);

  if (!business) {
    throw new Error("BUSINESS_NOT_FOUND");
  }

  return business;
}

async function getUser(userId: string) {
  const user = await User.findByPk(userId);

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  return user;
}

export async function createBusinessUser(
  tenantId: string,
  input: CreateBusinessUserInput
) {
  await getBusiness(tenantId);

  const email = input.email?.trim().toLowerCase();
  const password = input.password;

  if (!email) {
    throw new Error("EMAIL_REQUIRED");
  }

  if (!password) {
    throw new Error("PASSWORD_REQUIRED");
  }

  if (password.length < 8) {
    throw new Error("PASSWORD_TOO_SHORT");
  }

  const role = input.role || "STAFF";

  if (role !== "ADMIN" && role !== "STAFF") {
    throw new Error("INVALID_ROLE");
  }

  const existingUser = await User.findOne({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    id: randomUUID(),
    tenantId,
    email,
    password: hashedPassword,
    firstName: input.firstName?.trim() || null,
    lastName: input.lastName?.trim() || null,
    role,
    isEmailVerified: input.isEmailVerified ?? false,
    lastLogin: null,
  });

  return User.findByPk(user.id, {
    attributes: USER_ATTRIBUTES,
  });
}

export async function getBusinessUsers(tenantId: string) {
  await getBusiness(tenantId);

  return User.findAll({
    where: {
      tenantId,
    },
    attributes: USER_ATTRIBUTES,
    order: [["createdAt", "DESC"]],
  });
}

export async function getBusinessUser(
  tenantId: string,
  userId: string
) {
  await getBusiness(tenantId);

  const user = await User.findOne({
    where: {
      id: userId,
      tenantId,
    },
    attributes: USER_ATTRIBUTES,
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  return user;
}

export async function updateBusinessUser(
  tenantId: string,
  userId: string,
  input: UpdateBusinessUserInput
) {
  await getBusiness(tenantId);

  const user = await User.findOne({
    where: {
      id: userId,
      tenantId,
    },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  if (input.email !== undefined) {
    const email = input.email.trim().toLowerCase();

    if (!email) {
      throw new Error("EMAIL_REQUIRED");
    }

    const existingUser = await User.findOne({
      where: {
        email,
      },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new Error("EMAIL_ALREADY_EXISTS");
    }

    user.email = email;
  }

  if (input.password !== undefined) {
    if (input.password.length < 8) {
      throw new Error("PASSWORD_TOO_SHORT");
    }

    user.password = await bcrypt.hash(input.password, 12);
  }

  if (input.firstName !== undefined) {
    user.firstName = input.firstName?.trim() || null;
  }

  if (input.lastName !== undefined) {
    user.lastName = input.lastName?.trim() || null;
  }

  if (input.role !== undefined) {
    if (
      input.role !== "ADMIN" &&
      input.role !== "STAFF"
    ) {
      throw new Error("INVALID_ROLE");
    }

    const owner = await BusinessOwner.findOne({
      where: {
        tenantId,
        userId,
      },
    });

    if (owner && input.role !== "ADMIN") {
      throw new Error("OWNER_MUST_BE_ADMIN");
    }

    user.role = input.role;
  }

  if (input.isEmailVerified !== undefined) {
    user.isEmailVerified = input.isEmailVerified;
  }

  await user.save();

  return User.findByPk(user.id, {
    attributes: USER_ATTRIBUTES,
  });
}

export async function deleteBusinessUser(
  tenantId: string,
  userId: string
) {
  await getBusiness(tenantId);

  const user = await User.findOne({
    where: {
      id: userId,
      tenantId,
    },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  if (user.role === "SUPER_ADMIN") {
    throw new Error("CANNOT_DELETE_SUPER_ADMIN");
  }

  const owner = await BusinessOwner.findOne({
    where: {
      tenantId,
      userId,
    },
  });

  if (owner) {
    throw new Error("CANNOT_DELETE_BUSINESS_OWNER");
  }

  await user.destroy();

  return {
    success: true,
    message: "Business user deleted successfully",
  };
}