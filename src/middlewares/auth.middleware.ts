import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    tenantId: string;
    email: string;
    role: string;
  };
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // Prefer an explicit Bearer token so customer sessions cannot be
    // overridden by a stale admin cookie in the same browser.
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader) {
      const [type, bearerToken] = authHeader.split(" ");

      if (type === "Bearer" && bearerToken) {
        token = bearerToken;
      }
    }

    // Admin/browser sessions that rely on the HttpOnly cookie remain supported.
    if (!token) {
      token = req.cookies?.agentto_admin_token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET_NOT_DEFINED");
    }

    const decoded = jwt.verify(token, secret) as {
      userId: string;
      tenantId: string;
      email: string;
      role: string;
    };

    req.user = decoded;

    next();
  } catch (error) {
    console.error("JWT Error:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}
