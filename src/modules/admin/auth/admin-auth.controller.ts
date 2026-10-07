import { Request, Response } from "express";
import { loginSuperAdmin } from "./admin-auth.service";

export async function adminLogin(
  req: Request,
  res: Response
) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const result = await loginSuperAdmin({
      email,
      password,
    });

    // JWT فقط داخل HttpOnly Cookie ذخیره می‌شود
    res.cookie("agentto_admin_token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Super Admin login successful",
      data: {
        user: result.user,
      },
    });
  } catch (error: any) {
    if (error.message === "INVALID_CREDENTIALS") {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (error.message === "JWT_SECRET_NOT_DEFINED") {
      return res.status(500).json({
        success: false,
        message: "JWT_SECRET is not configured",
      });
    }

    console.error("SUPER ADMIN LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}


export function adminLogout(
  req: Request,
  res: Response
) {
  res.clearCookie("agentto_admin_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return res.status(200).json({
    success: true,
    message: "Super Admin logout successful",
  });
}