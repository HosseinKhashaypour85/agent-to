import { Request, Response } from "express";
import {
    registerUser,
    loginUser,
} from "./auth.service";

import User from "../../models/User";
import { AuthRequest } from "../../middlewares/auth.middleware";

export async function register(
    req: Request,
    res: Response

) {
    try {
        const { email, password, firstName, lastName } = req.body || {};
        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({
                success: false,
                msg: 'لطفا تمامی فیلد هارو کامل کنید'
            })
        }
        const user = await registerUser({ email, password, firstName, lastName });
        return res.status(201).json({
            success: true,
            msg: 'کاربر با موفقبت ثبت نام شد',
            data: user,
        })
    } catch (error: any) {
        if (error.message === "EMAIL_ALREADY_EXISTS") {
            return res.status(409).json({
                success: false,
                message: "Email already exists",
            });
        }

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

export async function login(req: Request, res: Response) {
    try {
        const { email, password } = req.body || {};
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                msg: "Email and password are required"
            })
        }
        const result = await loginUser({ email, password });
        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: result,
        });
    } catch (error: any) {
        if (error.message === "INVALID_CREDENTIALS") {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

export async function me(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await User.findByPk(req.user.userId, {
      attributes: {
        exclude: ["password"],
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}