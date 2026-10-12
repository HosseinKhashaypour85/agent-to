import { Router } from "express";
import { AuthRequest, authMiddleware } from "../../middlewares/auth.middleware";
import Site from "../../models/Site";
import CartIntegration, { CartEndpoint } from "../../models/CartIntegration";

const router = Router();
const ALLOWED_METHODS = new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]);

router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.tenantId) return res.status(401).json({ success: false, message: "Unauthorized" });
    const siteId = String(req.query.siteId || "");
    if (!siteId) return res.status(400).json({ success: false, message: "siteId is required" });
    const site = await Site.findOne({ where: { id: siteId, tenantId: req.user.tenantId } });
    if (!site) return res.status(404).json({ success: false, message: "Site not found" });
    const integration = await CartIntegration.findOne({ where: { siteId: site.id, tenantId: req.user.tenantId } });
    return res.json({ success: true, data: integration || { siteId: site.id, endpoints: [] } });
  } catch (error) {
    console.error("GET CART INTEGRATION ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to load cart integration" });
  }
});

router.put("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.tenantId) return res.status(401).json({ success: false, message: "Unauthorized" });
    const siteId = String(req.body?.siteId || "");
    const endpoints = req.body?.endpoints;
    if (!siteId || !Array.isArray(endpoints)) return res.status(400).json({ success: false, message: "siteId and endpoints are required" });
    if (endpoints.length > 20) return res.status(400).json({ success: false, message: "A maximum of 20 endpoints is allowed" });

    const normalized: CartEndpoint[] = [];
    for (const item of endpoints) {
      if (!item || typeof item.key !== "string" || typeof item.url !== "string" || typeof item.method !== "string") {
        return res.status(400).json({ success: false, message: "Each endpoint needs key, url and method" });
      }
      if (!ALLOWED_METHODS.has(item.method)) return res.status(400).json({ success: false, message: "Unsupported HTTP method" });
      if (item.url.trim()) {
        let parsed: URL;
        try { parsed = new URL(item.url); } catch { return res.status(400).json({ success: false, message: "Endpoint URL is invalid" }); }
        if (!["http:", "https:"].includes(parsed.protocol)) return res.status(400).json({ success: false, message: "Only HTTP(S) endpoint URLs are allowed" });
      }
      normalized.push({ key: item.key, label: String(item.label || item.key).slice(0, 100), url: item.url.trim(), method: item.method, enabled: Boolean(item.enabled), payload: typeof item.payload === "string" ? item.payload.slice(0, 4000) : "" } as CartEndpoint);
    }

    const site = await Site.findOne({ where: { id: siteId, tenantId: req.user.tenantId } });
    if (!site) return res.status(404).json({ success: false, message: "Site not found" });
    const [integration] = await CartIntegration.findOrCreate({
      where: { siteId: site.id, tenantId: req.user.tenantId },
      defaults: { siteId: site.id, tenantId: req.user.tenantId, endpoints: normalized },
    });
    if (!integration.isNewRecord) await integration.update({ endpoints: normalized });
    return res.json({ success: true, message: "Cart API settings saved", data: integration });
  } catch (error) {
    console.error("SAVE CART INTEGRATION ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to save cart integration" });
  }
});

export default router;
