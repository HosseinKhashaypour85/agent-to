import { Op } from "sequelize";

import Product from "../../models/Product";


// ============================================================
// Format Product
// ============================================================

export function formatProduct(
  product: Product
) {
  return {
    id: product.id,

    name: product.name,

    sku: product.sku,

    description:
      product.description,

    price:
      product.price,

    compareAtPrice:
      product.compareAtPrice,

    currency:
      product.currency,

    stock:
      product.stock,

    stockStatus:
      product.stockStatus,

    category:
      product.category,

    imageUrl:
      product.imageUrl,

    productUrl:
      product.productUrl,
  };
}


// ============================================================
// Find Product
// ============================================================

export async function findProductByName(
  tenantId: string,
  productName: string
) {
  const products =
    await Product.findAll({
      where: {
        tenantId,
        isActive: true,
      },

      order: [
        ["createdAt", "DESC"],
      ],

      limit: 100,
    });

  const query =
    productName
      .trim()
      .toLowerCase();

  // Exact match

  const exact =
    products.find(
      (product) =>
        product.name
          .trim()
          .toLowerCase() ===
        query
    );

  if (exact) {
    return exact;
  }

  // Contains match

  const contains =
    products.find(
      (product) => {
        const name =
          product.name
            .toLowerCase();

        return (
          name.includes(query) ||
          query.includes(name)
        );
      }
    );

  if (contains) {
    return contains;
  }

  // SKU

  const skuMatch =
    products.find(
      (product) =>
        product.sku &&
        product.sku
          .toLowerCase() ===
          query
    );

  if (skuMatch) {
    return skuMatch;
  }

  return null;
}


// ============================================================
// Product List
// ============================================================

export async function getProductList(
  tenantId: string,
  limit = 20
) {
  const safeLimit =
    Math.min(
      Math.max(limit, 1),
      50
    );

  const products =
    await Product.findAll({
      where: {
        tenantId,
        isActive: true,
      },

      order: [
        ["createdAt", "DESC"],
      ],

      limit: safeLimit,
    });

  const total =
    await Product.count({
      where: {
        tenantId,
        isActive: true,
      },
    });

  return {
    products:
      products.map(formatProduct),

    total,

    returned:
      products.length,
  };
}


// ============================================================
// Search Products
// ============================================================

export async function searchProductTool(
  tenantId: string,
  query: string
) {
  const products =
    await Product.findAll({
      where: {
        tenantId,

        isActive: true,

        [Op.or]: [
          {
            name: {
              [Op.like]:
                `%${query}%`,
            },
          },

          {
            sku: {
              [Op.like]:
                `%${query}%`,
            },
          },

          {
            description: {
              [Op.like]:
                `%${query}%`,
            },
          },
        ],
      },

      order: [
        ["createdAt", "DESC"],
      ],

      limit: 10,
    });

  return products.map(
    formatProduct
  );
}