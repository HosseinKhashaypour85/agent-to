import Product from "../../models/Product";

interface ResolveProductParams {
  tenantId: string;
  currentMessage: string;
  history: Array<{
    sender: string;
    content: string;
  }>;
}

export async function resolveCurrentProduct(
  data: ResolveProductParams
) {
  const products = await Product.findAll({
    where: {
      tenantId: data.tenantId,
      isActive: true,
    },
    limit: 100,
  });

  if (products.length === 0) {
    return null;
  }

  const text = [
    data.currentMessage,
    ...data.history
      .slice()
      .reverse()
      .slice(0, 15)
      .map((item) => item.content),
  ]
    .join(" ")
    .toLowerCase();

  // ----------------------------------------------------------
  // 1. Exact product name
  // ----------------------------------------------------------

  for (const product of products) {
    const productName = product.name.toLowerCase();

    if (text.includes(productName)) {
      return product;
    }
  }

  // ----------------------------------------------------------
  // 2. SKU
  // ----------------------------------------------------------

  for (const product of products) {
    if (!product.sku) continue;

    if (
      text.includes(product.sku.toLowerCase())
    ) {
      return product;
    }
  }

  // ----------------------------------------------------------
  // 3. Product name tokens
  // ----------------------------------------------------------

  const words = text
    .replace(/[؟?!،,.]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length >= 2);

  let bestProduct: Product | null = null;
  let bestScore = 0;

  for (const product of products) {
    const productWords = product.name
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length >= 2);

    let score = 0;

    for (const productWord of productWords) {
      if (words.includes(productWord)) {
        score++;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestProduct = product;
    }
  }

  return bestProduct;
}