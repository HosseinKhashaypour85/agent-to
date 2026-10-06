import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../models/User";
import Tenant from "../../models/Tenant";

export async function registerUser(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}) {
  const existingUser = await User.findOne({
    where: {
      email: data.email,
    },
  });

  if (existingUser) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  const tenant = await Tenant.create({
    email: data.email,
    name: `${data.firstName}'s Business`,
    slug: `${data.firstName}-${Date.now()}`.toLowerCase(),
  });
  // ایجاد User
  const user = await User.create({
    tenantId: tenant.id,
    email: data.email,
    password: passwordHash,
    firstName: data.firstName,
    lastName: data.lastName,
    role: "ADMIN",
    isEmailVerified: false,
    lastLogin: null,
  });

  return {
    id: user.id,
    tenantId: user.tenantId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
  };
}

export async function loginUser(data: {
  email: string;
  password: string;
}) {
  const user = await User.findOne({
    where: {
      email: data.email,
    },
  });

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const passwordValid = await bcrypt.compare(
    data.password,
    user.password
  );

  if (!passwordValid) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET_NOT_DEFINED");
  }

  const token = jwt.sign(
    {
      userId: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
    },
    secret,
    {
      expiresIn: "7d",
    }
  );

  await user.update({
    lastLogin: new Date(),
  });

  return {
    token,
    user: {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
  };
}