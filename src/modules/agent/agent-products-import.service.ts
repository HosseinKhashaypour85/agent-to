import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { createProduct } from "./agent-products.service";

type ImportMode = "api" | "file";
type ImportSource = "JSON" | "EXCEL";

function isPrivateIpv4(ip: string) {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return true;
  const [a, b] = parts;
  return a === 0 || a === 10 || a === 127 || a >= 224 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127);
}

function isPrivateIpv6(ip: string) {
  const value = ip.toLowerCase();
  return value === "::1" || value === "::" || value.startsWith("fc") ||
    value.startsWith("fd") || value.startsWith("fe80:") ||
    value.startsWith("::ffff:127.") || value.startsWith("::ffff:10.") ||
    value.startsWith("::ffff:192.168.");
}

async function assertPublicHttpsUrl(value: unknown): Promise<URL> {
  if (typeof value !== "string" || !value.trim()) throw new Error("API_URL_REQUIRED");
  let url: URL;
  try { url = new URL(value); } catch { throw new Error("INVALID_API_URL"); }
  if (url.protocol !== "https:" || url.username || url.password) throw new Error("API_URL_MUST_USE_HTTPS");
  const host = url.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) throw new Error("API_URL_NOT_PUBLIC");
  const ipVersion = isIP(host);
  if (ipVersion) {
    if ((ipVersion === 4 && isPrivateIpv4(host)) || (ipVersion === 6 && isPrivateIpv6(host))) throw new Error("API_URL_NOT_PUBLIC");
    throw new Error("API_URL_DOMAIN_REQUIRED");
  }
  const addresses = await lookup(host, { all: true, verbatim: true });
  if (!addresses.length || addresses.some((entry) => entry.family === 4 ? isPrivateIpv4(entry.address) : isPrivateIpv6(entry.address))) {
    throw new Error("API_URL_NOT_PUBLIC");
  }
  return url;
}

function unwrapProducts(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  const candidates = [
    payload?.products,
    payload?.items,
    payload?.results,
    payload?.data,
    payload?.data?.products,
    payload?.data?.items,
    payload?.data?.results,
  ];
  return candidates.find(Array.isArray) || [];
}

function normalizeProduct(value: any) {
  const row = value && typeof value === "object" ? value : {};
  const pick = (...keys: string[]) => {
    for (const key of keys) {
      const value = row[key];
      if (value !== undefined && value !== null && value !== "") return value;
    }
    return undefined;
  };
  const numberOrUndefined = (value: unknown) => {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
    return undefined;
  };
  const product: Record<string, unknown> = {
    name: String(pick("name", "title", "product_name", "نام محصول") ?? "").trim(),
    source: "CUSTOM_API",
    sourceType: "CUSTOM_API",
    rawData: row,
  };
  const externalId = pick("id", "productId", "product_id", "externalId", "external_id");
  const sku = pick("sku", "SKU", "code", "product_code", "کد محصول");
  const description = pick("description", "short_description", "توضیحات");
  const category = pick("category", "category_name", "دسته‌بندی");
  const imageUrl = pick("imageUrl", "image", "image_url", "thumbnail");
  const productUrl = pick("productUrl", "url", "permalink", "link");
  const price = numberOrUndefined(pick("price", "regular_price", "قیمت"));
  const stock = numberOrUndefined(pick("stock", "stock_quantity", "quantity", "موجودی"));
  if (externalId !== undefined) product.externalId = String(externalId);
  if (sku !== undefined) product.sku = String(sku);
  if (description !== undefined) product.description = String(description);
  if (category !== undefined) product.category = String(category);
  if (imageUrl !== undefined) product.imageUrl = String(imageUrl);
  if (productUrl !== undefined) product.productUrl = String(productUrl);
  if (price !== undefined) product.price = price;
  if (stock !== undefined) {
    product.stock = stock;
    product.stockStatus = stock <= 0 ? "OUT_OF_STOCK" : stock <= 5 ? "LOW_STOCK" : "IN_STOCK";
  }
  return product;
}

export async function importProducts(
  tenantId: string,
  input: { mode?: unknown; source?: unknown; url?: unknown; authType?: unknown; token?: unknown; apiKeyHeader?: unknown; products?: unknown }
) {
  let rows: any[];
  let source: "CUSTOM_API" | "MANUAL";

  if (input.mode === "api") {
    const url = await assertPublicHttpsUrl(input.url);
    const headers: Record<string, string> = { Accept: "application/json" };
    const token = typeof input.token === "string" ? input.token.trim() : "";
    if (input.authType === "bearer" && token) headers.Authorization = `Bearer ${token}`;
    if (input.authType === "apiKey" && token) {
      const key = typeof input.apiKeyHeader === "string" ? input.apiKeyHeader.trim() : "x-api-key";
      if (!/^[A-Za-z0-9-]{1,64}$/.test(key)) throw new Error("INVALID_API_KEY_HEADER");
      headers[key] = token;
    }
    const response = await fetch(url, { headers, signal: AbortSignal.timeout(15000), redirect: "error" });
    if (!response.ok) throw new Error(`SOURCE_API_HTTP_${response.status}`);
    const payload = await response.json().catch(() => { throw new Error("SOURCE_API_INVALID_JSON"); });
    rows = unwrapProducts(payload);
    source = "CUSTOM_API";
  } else if (input.mode === "file" && (input.source === "JSON" || input.source === "EXCEL")) {
    if (!Array.isArray(input.products)) throw new Error("PRODUCTS_ARRAY_REQUIRED");
    rows = input.products;
    source = "MANUAL";
  } else {
    throw new Error("INVALID_IMPORT_MODE");
  }

  if (!rows.length) throw new Error("NO_PRODUCTS_FOUND");
  if (rows.length > 2000) throw new Error("IMPORT_LIMIT_EXCEEDED");

  const products = rows.map((row) => {
    const normalized = normalizeProduct(row);
    if (source === "MANUAL") {
      normalized.source = "MANUAL";
      normalized.sourceType = "MANUAL";
    } else {
      normalized.source = "CUSTOM_API";
      normalized.sourceType = "CUSTOM_API";
    }
    return normalized;
  });

  const invalidIndex = products.findIndex((product) => !product.name);
  if (invalidIndex !== -1) throw new Error(`PRODUCT_NAME_REQUIRED_AT_ROW_${invalidIndex + 1}`);

  let imported = 0;
  for (const product of products) {
    await createProduct(tenantId, product);
    imported += 1;
  }

  return { imported, source, total: rows.length };
}
