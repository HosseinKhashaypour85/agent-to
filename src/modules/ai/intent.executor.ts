import {
  findProductByName,
  getProductList,
  formatProduct,
} from "../product/product.tool";

import {
  IntentResult,
} from "./intent.service";

export interface IntentExecutionResult {
  intent: string;

  success: boolean;

  product?: ReturnType<typeof formatProduct> | null;

  products?: ReturnType<typeof formatProduct>[];

  total?: number;

  returned?: number;

  message?: string;
}


// ============================================================
// Execute Intent
// ============================================================

export async function executeIntent(
  data: {
    tenantId: string;
    intent: IntentResult;
  }
): Promise<IntentExecutionResult> {
  const {
    tenantId,
    intent,
  } = data;


  // ==========================================================
  // GENERAL
  // ==========================================================

  if (intent.intent === "general") {
    return {
      intent: "general",

      success: true,

      message:
        "گفتگوی عمومی است. Product Tool اجرا نشود.",
    };
  }


  // ==========================================================
  // UNKNOWN
  // ==========================================================

  if (intent.intent === "unknown") {
    return {
      intent: "unknown",

      success: false,

      message:
        "Intent مشخص نیست.",
    };
  }


  // ==========================================================
  // NON-PRODUCT INTENTS
  // ==========================================================
  // این Intentها نباید Product Tool اجرا کنند.
  // پاسخ نهایی آن‌ها از Knowledge Base + AI ساخته می‌شود.
  // ==========================================================

  if (
    intent.intent === "shipping" ||
    intent.intent === "payment" ||
    intent.intent === "order" ||
    intent.intent === "return"
  ) {
    return {
      intent: intent.intent,

      success: true,

      message:
        `Intent «${intent.intent}» شناسایی شد. Product Tool اجرا نشود.`,
    };
  }


  // ==========================================================
  // PRODUCT LIST
  // ==========================================================

  if (intent.intent === "product_list") {
    const result = await getProductList(
      tenantId,
      20
    );

    return {
      intent: "product_list",

      success: true,

      products: result.products,

      total: result.total,

      returned: result.returned,
    };
  }


  // ==========================================================
  // PRODUCT INTENTS
  // ==========================================================

  const productIntents = [
    "price",
    "stock",
    "product_search",
    "product_details",
    "product_link",
  ];

  if (!productIntents.includes(intent.intent)) {
    return {
      intent: intent.intent,

      success: false,

      message:
        "این Intent هنوز توسط Product Tool پشتیبانی نمی‌شود.",
    };
  }


  // ==========================================================
  // PRODUCT NAME REQUIRED
  // ==========================================================

  if (!intent.productName) {
    return {
      intent: intent.intent,

      success: false,

      product: null,

      message:
        "نام محصول مشخص نشد.",
    };
  }


  // ==========================================================
  // FIND PRODUCT
  // ==========================================================

  const product = await findProductByName(
    tenantId,
    intent.productName
  );


  // ==========================================================
  // PRODUCT NOT FOUND
  // ==========================================================

  if (!product) {
    return {
      intent: intent.intent,

      success: false,

      product: null,

      message:
        `محصول «${intent.productName}» در سیستم پیدا نشد.`,
    };
  }


  // ==========================================================
  // PRODUCT FOUND
  // ==========================================================

  return {
    intent: intent.intent,

    success: true,

    product: formatProduct(product),
  };
}