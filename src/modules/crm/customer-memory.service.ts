import CustomerMemory from "../../models/CustomerMemory";

export interface MemoryInput {
  tenantId: string;
  customerId: string;
  key: string;
  value: string;
  source?: string;
  confidence?: number;
}

export async function setCustomerMemory(data: MemoryInput) {
  const { tenantId, customerId, key, value, source = "AI", confidence = 1.0 } = data;

  if (!tenantId?.trim()) {
    throw new Error("TENANT_ID_REQUIRED");
  }
  if (!customerId?.trim()) {
    throw new Error("CUSTOMER_ID_REQUIRED");
  }
  if (!key?.trim()) {
    throw new Error("MEMORY_KEY_REQUIRED");
  }
  if (!value?.trim()) {
    throw new Error("MEMORY_VALUE_REQUIRED");
  }

  const [memory, created] = await CustomerMemory.findOrCreate({
    where: {
      tenantId,
      customerId,
      key: key.trim(),
    },
    defaults: {
      tenantId,
      customerId,
      key: key.trim(),
      value: value.trim(),
      source,
      confidence: Math.max(0, Math.min(1, confidence)),
    },
  });

  if (!created) {
    memory.value = value.trim();
    memory.source = source;
    memory.confidence = Math.max(0, Math.min(1, confidence));
    await memory.save();
  }

  return { memory, created };
}

export async function getCustomerMemory(tenantId: string, customerId: string, key?: string) {
  if (!tenantId?.trim()) {
    throw new Error("TENANT_ID_REQUIRED");
  }
  if (!customerId?.trim()) {
    throw new Error("CUSTOMER_ID_REQUIRED");
  }

  const where: Record<string, unknown> = { tenantId, customerId };
  if (key?.trim()) {
    where.key = key.trim();
  }

  return CustomerMemory.findAll({
    where,
    order: [["updatedAt", "DESC"]],
  });
}

export async function getCustomerMemoryValue(tenantId: string, customerId: string, key: string) {
  const memory = await CustomerMemory.findOne({
    where: { tenantId, customerId, key: key.trim() },
  });
  return memory?.value || null;
}

export async function deleteCustomerMemory(tenantId: string, customerId: string, key: string) {
  const result = await CustomerMemory.destroy({
    where: { tenantId, customerId, key: key.trim() },
  });
  return result > 0;
}

export async function extractAndStoreMemory(data: {
  tenantId: string;
  customerId: string;
  userMessage: string;
  intent: string;
  productName?: string | null;
}) {
  const { tenantId, customerId, userMessage, intent, productName } = data;
  const memories: Array<{ key: string; value: string }> = [];

  if (productName?.trim()) {
    await setCustomerMemory({
      tenantId,
      customerId,
      key: "last_discussed_product",
      value: productName.trim(),
      source: "AI",
      confidence: 0.9,
    });
    memories.push({ key: "last_discussed_product", value: productName.trim() });

    const existingProducts = await getCustomerMemoryValue(tenantId, customerId, "interested_products");
    let products: string[] = [];
    try {
      products = existingProducts ? JSON.parse(existingProducts) : [];
    } catch {
      products = [];
    }
    if (!products.includes(productName.trim())) {
      products.push(productName.trim());
      await setCustomerMemory({
        tenantId,
        customerId,
        key: "interested_products",
        value: JSON.stringify(products),
        source: "AI",
        confidence: 0.8,
      });
    }
  }

  const intentMapping: Record<string, string> = {
    price: "price_inquired",
    stock: "stock_checked",
    shipping: "shipping_inquired",
    payment: "payment_inquired",
    order: "order_intent",
    return: "return_inquired",
    product_details: "product_details_viewed",
    product_search: "product_searched",
  };

  if (intentMapping[intent]) {
    await setCustomerMemory({
      tenantId,
      customerId,
      key: intentMapping[intent],
      value: new Date().toISOString(),
      source: "AI",
      confidence: 0.85,
    });
    memories.push({ key: intentMapping[intent], value: new Date().toISOString() });
  }

  const buyingSignals = ["میخوام", "می‌خوام", "سفارش", "خرید", "بخرم", "پرداخت", "ثبت سفارش"];
  const hasBuyingSignal = buyingSignals.some((signal) => userMessage.includes(signal));

  if (hasBuyingSignal || intent === "order") {
    await setCustomerMemory({
      tenantId,
      customerId,
      key: "purchase_intent",
      value: "high",
      source: "AI",
      confidence: 0.95,
    });
    memories.push({ key: "purchase_intent", value: "high" });
  }

  return memories;
}

export async function getCustomerSummary(tenantId: string, customerId: string) {
  const memories = await getCustomerMemory(tenantId, customerId);
  const summary: Record<string, unknown> = {};

  for (const mem of memories) {
    if (mem.key === "interested_products") {
      try {
        summary[mem.key] = JSON.parse(mem.value);
      } catch {
        summary[mem.key] = [];
      }
    } else if (mem.key === "last_discussed_product" || mem.key === "purchase_intent") {
      summary[mem.key] = mem.value;
    } else if (mem.key.endsWith("_inquired") || mem.key.endsWith("_checked") || mem.key.endsWith("_viewed") || mem.key.endsWith("_searched")) {
      summary[mem.key] = mem.value;
    }
  }

  return summary;
}