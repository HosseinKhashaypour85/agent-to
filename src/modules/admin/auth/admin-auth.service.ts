import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../../models/User";

export async function loginSuperAdmin(data: {
  email: string;
  password: string;
}) {
  const user = await User.findOne({
    where: {
      email: data.email,
      role: "SUPER_ADMIN",
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