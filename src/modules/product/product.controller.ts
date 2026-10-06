import { Request, Response } from "express";

import { AuthRequest } from "../../middlewares/auth.middleware";

import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "./product.service";

export async function create(req: AuthRequest, res: Response) {
  try {
    const tenantId = req.user!.tenantId;

    const body = req.body || {};

    if (!body.name) {
      return res.status(400).json({
        success: false,
        message: "Product name is required",
      });
    }

    const product = await createProduct({
      tenantId,
      ...body,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.error("Create Product Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create product",
    });
  }
}

export async function list(req: AuthRequest, res: Response) {
  try {
    const tenantId = req.user!.tenantId;

    const search =
      typeof req.query.search === "string"
        ? req.query.search
        : undefined;

    const category =
      typeof req.query.category === "string"
        ? req.query.category
        : undefined;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const products = await getProducts(tenantId, {
      search,
      category,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Get Products Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get products",
    });
  }
}

export async function getOne(
  req: AuthRequest,
  res: Response
) {
  try {
    const tenantId = req.user!.tenantId;
    const id = String(req.params.id);

    const product = await getProductById(
      tenantId,
      id
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Get Product Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get product",
    });
  }
}

export async function update(
  req: AuthRequest,
  res: Response
) {
  try {
    const tenantId = req.user!.tenantId;
    const id = String(req.params.id);

    const product = await updateProduct(
      tenantId,
      id,
      req.body || {}
    );

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error: any) {
    console.error("Update Product Error:", error);

    if (error.message === "PRODUCT_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update product",
    });
  }
}

export async function remove(
  req: AuthRequest,
  res: Response
) {
  try {
    const tenantId = req.user!.tenantId;
    const id = String(req.params.id);

    await deleteProduct(
      tenantId,
      id
    );

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete Product Error:", error);

    if (error.message === "PRODUCT_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to delete product",
    });
  }
}