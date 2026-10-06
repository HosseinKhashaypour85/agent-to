import { Op } from "sequelize";
import Product, {
  ProductSource,
  ProductStockStatus,
} from "../../models/Product";

interface CreateProductData {
  tenantId: string;
  externalId?: string | null;
  name: string;
  sku?: string | null;
  description?: string | null;
  price?: number | null;
  compareAtPrice?: number | null;
  currency?: string;
  stock?: number | null;
  stockStatus?: ProductStockStatus;
  category?: string | null;
  imageUrl?: string | null;
  productUrl?: string | null;
  source?: ProductSource;
  sourceType?: ProductSource;
  rawData?: object | null;
}

export async function createProduct(data: CreateProductData) {
  return Product.create({
    tenantId: data.tenantId,
    externalId: data.externalId ?? null,
    name: data.name,
    sku: data.sku ?? null,
    description: data.description ?? null,
    price: data.price ?? null,
    compareAtPrice: data.compareAtPrice ?? null,
    currency: data.currency ?? "IRR",
    stock: data.stock ?? null,
    stockStatus: data.stockStatus ?? "UNKNOWN",
    category: data.category ?? null,
    imageUrl: data.imageUrl ?? null,
    productUrl: data.productUrl ?? null,
    source: data.source ?? "MANUAL",
    sourceType: data.sourceType ?? "MANUAL",
    isActive: true,
    lastSyncedAt: null,
    rawData: data.rawData ?? null,
  });
}

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
  const page = Math.max(options?.page ?? 1, 1);
  const limit = Math.min(Math.max(options?.limit ?? 20, 1), 100);

  const where: any = {
    tenantId,
  };

  if (options?.isActive !== undefined) {
    where.isActive = options.isActive;
  }

  if (options?.category) {
    where.category = options.category;
  }

  if (options?.search) {
    where[Op.or] = [
      {
        name: {
          [Op.like]: `%${options.search}%`,
        },
      },
      {
        sku: {
          [Op.like]: `%${options.search}%`,
        },
      },
      {
        description: {
          [Op.like]: `%${options.search}%`,
        },
      },
    ];
  }

  const result = await Product.findAndCountAll({
    where,
    order: [["createdAt", "DESC"]],
    limit,
    offset: (page - 1) * limit,
  });

  return {
    products: result.rows,
    pagination: {
      page,
      limit,
      total: result.count,
      totalPages: Math.ceil(result.count / limit),
    },
  };
}

export async function getProductById(
  tenantId: string,
  id: string
) {
  return Product.findOne({
    where: {
      id,
      tenantId,
    },
  });
}

export async function updateProduct(
  tenantId: string,
  id: string,
  data: Partial<CreateProductData>
) {
  const product = await Product.findOne({
    where: {
      id,
      tenantId,
    },
  });

  if (!product) {
    throw new Error("PRODUCT_NOT_FOUND");
  }

  await product.update(data);

  return product;
}

export async function deleteProduct(
  tenantId: string,
  id: string
) {
  const product = await Product.findOne({
    where: {
      id,
      tenantId,
    },
  });

  if (!product) {
    throw new Error("PRODUCT_NOT_FOUND");
  }

  await product.destroy();

  return true;
}

export async function searchProducts(
  tenantId: string,
  query: string
) {
  return Product.findAll({
    where: {
      tenantId,
      isActive: true,
      [Op.or]: [
        {
          name: {
            [Op.like]: `%${query}%`,
          },
        },
        {
          sku: {
            [Op.like]: `%${query}%`,
          },
        },
        {
          description: {
            [Op.like]: `%${query}%`,
          },
        },
      ],
    },
    order: [["createdAt", "DESC"]],
    limit: 10,
  });
}