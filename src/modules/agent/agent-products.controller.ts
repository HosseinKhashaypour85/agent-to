import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";

import {
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
} from "./agent-products.service";

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

    const result = await getProducts(
      req.user.tenantId,
      {
        search:
          typeof req.query.search === "string"
            ? req.query.search
            : undefined,

        category:
          typeof req.query.category === "string"
            ? req.query.category
            : undefined,

        isActive:
          req.query.isActive === undefined
            ? undefined
            : req.query.isActive === "true",

        page:
          typeof req.query.page === "string"
            ? Number(req.query.page)
            : undefined,

        limit:
          typeof req.query.limit === "string"
            ? Number(req.query.limit)
            : undefined,
      }
    );

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error(
      "GET AGENT PRODUCTS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function get(
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

    const product = await getProduct(
      req.user.tenantId,
      String(req.params.id)
    );

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error: any) {
    console.error(
      "GET AGENT PRODUCT ERROR:",
      error
    );

    if (
      error?.message === "PRODUCT_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

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

    const product = await createProduct(
      req.user.tenantId,
      req.body || {}
    );

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error: any) {
    console.error(
      "CREATE AGENT PRODUCT ERROR:",
      error
    );

    if (
      error?.message ===
      "PRODUCT_NAME_REQUIRED"
    ) {
      return res.status(400).json({
        success: false,
        message: "Product name is required",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function update(
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

    const product = await updateProduct(
      req.user.tenantId,
      String(req.params.id),
      req.body || {}
    );

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error: any) {
    console.error(
      "UPDATE AGENT PRODUCT ERROR:",
      error
    );

    if (
      error?.message === "PRODUCT_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function remove(
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

    await deleteProduct(
      req.user.tenantId,
      String(req.params.id)
    );

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error: any) {
    console.error(
      "DELETE AGENT PRODUCT ERROR:",
      error
    );

    if (
      error?.message === "PRODUCT_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}