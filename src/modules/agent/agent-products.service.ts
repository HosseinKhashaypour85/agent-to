import { randomUUID } from "crypto";
import { Op } from "sequelize";

import Product, {
  ProductSource,
  ProductStockStatus,
} from "../../models/Product";

export async function getProducts(
  tenantId: string,
  options?: {
    search?: string;
    category?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }
) {
  if (!tenantId?.trim()) {
    throw new Error("TENANT_ID_REQUIRED");
  }

  const page = Math.max(Number(options?.page) || 1, 1);
  const limit = Math.min(
    Math.max(Number(options?.limit) || 20, 1),
    100
  );

  const offset = (page - 1) * limit;

  const where: any = {
    tenantId,
  };

  if (options?.search?.trim()) {
    const search = options.search.trim();

    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { sku: { [Op.like]: `%${search}%` } },
      { externalId: { [Op.like]: `%${search}%` } },
    ];
  }

  if (options?.category?.trim()) {
    where.category = options.category.trim();
  }

  if (options?.isActive !== undefined) {
    where.isActive = options.isActive;
  }

  const { rows, count } = await Product.findAndCountAll({
    where,
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });

  return {
    products: rows,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
}

export async function getProduct(
  tenantId: string,
  productId: string
) {
  if (!tenantId?.trim()) {
    throw new Error("TENANT_ID_REQUIRED");
  }

  if (!productId?.trim()) {
    throw new Error("PRODUCT_ID_REQUIRED");
  }

  const product = await Product.findOne({
    where: {
      id: productId,
      tenantId,
    },
  });

  if (!product) {
    throw new Error("PRODUCT_NOT_FOUND");
  }

  return product;
}

export async function createProduct(
  tenantId: string,
  data: Record<string, unknown>
) {
  if (!tenantId?.trim()) {
    throw new Error("TENANT_ID_REQUIRED");
  }

  if (
    typeof data.name !== "string" ||
    !data.name.trim()
  ) {
    throw new Error("PRODUCT_NAME_REQUIRED");
  }

  const product = await Product.create({
    id: randomUUID(),
    tenantId,

    externalId:
      typeof data.externalId === "string"
        ? data.externalId.trim() || null
        : null,

    name: data.name.trim(),

    sku:
      typeof data.sku === "string"
        ? data.sku.trim() || null
        : null,

    description:
      typeof data.description === "string"
        ? data.description.trim() || null
        : null,

    price:
      typeof data.price === "number"
        ? data.price
        : null,

    compareAtPrice:
      typeof data.compareAtPrice === "number"
        ? data.compareAtPrice
        : null,

    currency:
      typeof data.currency === "string" &&
      data.currency.trim()
        ? data.currency.trim()
        : "IRR",

    stock:
      typeof data.stock === "number"
        ? data.stock
        : null,

    stockStatus:
      isValidStockStatus(data.stockStatus)
        ? data.stockStatus
        : "UNKNOWN",

    category:
      typeof data.category === "string"
        ? data.category.trim() || null
        : null,

    imageUrl:
      typeof data.imageUrl === "string"
        ? data.imageUrl.trim() || null
        : null,

    productUrl:
      typeof data.productUrl === "string"
        ? data.productUrl.trim() || null
        : null,

    source:
      isValidSource(data.source)
        ? data.source
        : "MANUAL",

    sourceType:
      isValidSource(data.sourceType)
        ? data.sourceType
        : "MANUAL",

    isActive:
      typeof data.isActive === "boolean"
        ? data.isActive
        : true,

    lastSyncedAt: null,

    rawData:
      data.rawData &&
      typeof data.rawData === "object"
        ? data.rawData
        : null,
  });

  return product;
}

export async function updateProduct(
  tenantId: string,
  productId: string,
  data: Record<string, unknown>
) {
  const product = await getProduct(
    tenantId,
    productId
  );

  const updateData: Record<string, unknown> = {};

  if (
    typeof data.name === "string" &&
    data.name.trim()
  ) {
    updateData.name = data.name.trim();
  }

  const stringFields = [
    "externalId",
    "sku",
    "description",
    "currency",
    "category",
    "imageUrl",
    "productUrl",
  ];

  for (const field of stringFields) {
    if (typeof data[field] === "string") {
      updateData[field] =
        data[field].trim() || null;
    }
  }

  if (typeof data.price === "number") {
    updateData.price = data.price;
  }

  if (typeof data.compareAtPrice === "number") {
    updateData.compareAtPrice =
      data.compareAtPrice;
  }

  if (typeof data.stock === "number") {
    updateData.stock = data.stock;
  }

  if (isValidStockStatus(data.stockStatus)) {
    updateData.stockStatus =
      data.stockStatus;
  }

  if (isValidSource(data.source)) {
    updateData.source = data.source;
  }

  if (isValidSource(data.sourceType)) {
    updateData.sourceType =
      data.sourceType;
  }

  if (typeof data.isActive === "boolean") {
    updateData.isActive = data.isActive;
  }

  if (
    data.rawData &&
    typeof data.rawData === "object"
  ) {
    updateData.rawData = data.rawData;
  }

  await product.update(updateData);

  return product;
}

export async function deleteProduct(
  tenantId: string,
  productId: string
) {
  const product = await getProduct(
    tenantId,
    productId
  );

  await product.destroy();

  return true;
}

function isValidSource(
  value: unknown
): value is ProductSource {
  return (
    value === "WOOCOMMERCE" ||
    value === "CUSTOM_API" ||
    value === "CUSTOM_ENDPOINT" ||
    value === "MANUAL"
  );
}

function isValidStockStatus(
  value: unknown
): value is ProductStockStatus {
  return (
    value === "IN_STOCK" ||
    value === "OUT_OF_STOCK" ||
    value === "LOW_STOCK" ||
    value === "UNKNOWN"
  );
}