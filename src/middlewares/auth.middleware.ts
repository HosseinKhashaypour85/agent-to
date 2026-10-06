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
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization header is required",
      });
    }

    const [type, token] = authHeader.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format",
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