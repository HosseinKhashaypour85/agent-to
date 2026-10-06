import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";

export function superAdminMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Super Admin access required",
    });
  }

  next();
}