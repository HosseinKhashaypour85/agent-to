import { Response } from "express";

import { AuthRequest } from "../../middlewares/auth.middleware";

import {
  createCustomer,
  getCustomers,
  getCustomerById,
} from "./customer.service";

export async function create(
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

    const {
      firstName,
      lastName,
      phone,
      email,
      telegramId,
      username,
      referredBy,
    } = req.body || {};

    if (!firstName && !lastName && !phone && !email) {
      return res.status(400).json({
        success: false,
        message:
          "At least one customer identity field is required",
      });
    }

    const customer = await createCustomer({
      tenantId: req.user.tenantId,

      firstName,
      lastName,
      phone,
      email,
      telegramId,
      username,
      referredBy,
    });

    return res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: customer,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function list(
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

    const customers = await getCustomers(
      req.user.tenantId
    );

    return res.status(200).json({
      success: true,
      data: customers,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getOne(
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

    const customer = await getCustomerById(
      req.user.tenantId,
      String(req.params.id)
    );

    return res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error: any) {
    if (error.message === "CUSTOMER_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
