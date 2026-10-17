import { Request, Response } from "express";
import { Op } from "sequelize";
import Site from "../../models/Site";
import Product from "../../models/Product";

function hostname(value: unknown): string {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  try {
    return new URL(raw.includes("://") ? raw : `https://${raw}`).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
}

function stockStatus(value: unknown): "IN_STOCK" | "OUT_OF_STOCK" | "LOW_STOCK" | "UNKNOWN" {
  const status = String(value ?? "").toLowerCase();
  if (["instock", "in_stock", "available", "in stock"].includes(status)) return "IN_STOCK";
  if (["outofstock", "out_of_stock", "unavailable", "out of stock"].includes(status)) return "OUT_OF_STOCK";
  if (["low_stock", "lowstock"].includes(status)) return "LOW_STOCK";
  return "UNKNOWN";
}

export async function syncWordPressProducts(req: Request, res: Response) {
  try {
    const siteId = String(req.params.siteId ?? "").trim();
    const domain = hostname(req.body?.domain);
    const products = req.body?.products;

    if (!siteId || !domain || !Array.isArray(products)) {
      return res.status(400).json({ success: false, message: "siteId, domain and products are required" });
    }
    if (products.length > 100) {
      return res.status(413).json({ success: false, message: "A maximum of 100 products is allowed per batch" });
    }

    const site = await Site.findOne({ where: { siteId, status: "ACTIVE" } });
    if (!site) return res.status(404).json({ success: false, message: "Site not found or inactive" });

    if (hostname(site.domain) !== domain) {
      return res.status(403).json({ success: false, message: "The supplied domain does not match the registered site" });
    }

    let created = 0;
    let updated = 0;
    for (const raw of products) {
      const externalId = String(raw?.id ?? "").trim();
      const name = String(raw?.name ?? "").trim().slice(0, 255);
      if (!externalId || !name) continue;

      const priceValue = raw?.price;
      const price = priceValue !== null && priceValue !== "" && Number.isFinite(Number(priceValue)) ? Number(priceValue) : null;
      const source = String(raw?.source ?? "").toLowerCase() === "woocommerce" ? "WOOCOMMERCE" : "CUSTOM_ENDPOINT";
      const values = {
        name,
        sku: raw?.sku ? String(raw.sku).slice(0, 191) : null,
        description: raw?.description ? String(raw.description).slice(0, 60000) : null,
        price,
        currency: String(raw?.currency ?? "IRT").slice(0, 10) || "IRT",
        stockStatus: stockStatus(raw?.stock_status),
        imageUrl: raw?.image ? String(raw.image).slice(0, 1000) : null,
        productUrl: raw?.url ? String(raw.url).slice(0, 1000) : null,
        source,
        sourceType: source,
        isActive: true,
        lastSyncedAt: new Date(),
        rawData: { wordpressSiteId: siteId, wordpressProductId: externalId, source: raw?.source ?? "wordpress" },
      };

      const existing = await Product.findOne({
        where: {
          tenantId: site.tenantId,
          externalId,
          sourceType: { [Op.in]: ["WOOCOMMERCE", "CUSTOM_ENDPOINT"] },
        },
      });

      if (existing) {
        await existing.update(values);
        updated++;
      } else {
        await Product.create({
          tenantId: site.tenantId,
          externalId,
          ...values,
        });
        created++;
      }
    }

    return res.status(200).json({ success: true, data: { received: products.length, created, updated } });
  } catch (error) {
    console.error("WORDPRESS PRODUCT SYNC ERROR:", error);
    return res.status(500).json({ success: false, message: "Product sync failed" });
  }
}
