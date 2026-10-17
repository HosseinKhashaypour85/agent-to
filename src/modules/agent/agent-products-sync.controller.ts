import axios from "axios";
import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import Site from "../../models/Site";

function siteBaseUrl(value: string): string {
  const raw = String(value ?? "").trim();
  const url = new URL(raw.includes("://") ? raw : `https://${raw}`);
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("INVALID_SITE_URL");
  }
  return url.origin;
}

export async function syncWordPressProductsNow(req: AuthRequest, res: Response) {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const sites = await Site.findAll({
      where: { tenantId, status: "ACTIVE" },
      order: [["createdAt", "DESC"]],
    });

    if (!sites.length) {
      return res.status(404).json({
        success: false,
        message: "هیچ سایت فعالی برای این حساب ثبت نشده است.",
      });
    }

    const results = await Promise.all(sites.map(async (site) => {
      try {
        const baseUrl = siteBaseUrl(site.domain);
        const response = await axios.post(
          `${baseUrl}/wp-json/agent-to/v1/products/sync`,
          { siteId: site.siteId },
          {
            timeout: 25000,
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            validateStatus: () => true,
          }
        );

        const body = response.data ?? {};
        const ok = response.status >= 200 && response.status < 300 && body.success === true;
        return {
          siteId: site.siteId,
          domain: site.domain,
          success: ok,
          status: response.status,
          message: ok
            ? String(body.message ?? "همگام‌سازی شروع شد.")
            : String(body.message ?? "افزونه Agent-To در این سایت پاسخ معتبر نداد."),
        };
      } catch (error) {
        const message = axios.isAxiosError(error)
          ? error.code === "ECONNABORTED"
            ? "پاسخ سایت بیش از حد طول کشید."
            : error.response
              ? `سایت با خطای HTTP ${error.response.status} پاسخ داد.`
              : "اتصال به سایت برقرار نشد یا افزونه Agent-To نصب نیست."
          : "آدرس سایت معتبر نیست.";
        return { siteId: site.siteId, domain: site.domain, success: false, message };
      }
    }));

    const succeeded = results.filter((item) => item.success).length;
    return res.status(200).json({
      success: succeeded > 0,
      message: succeeded
        ? `درخواست شناسایی برای ${succeeded} سایت ارسال شد.`
        : "هیچ سایت وردپرسی آماده همگام‌سازی پیدا نشد.",
      data: { attempted: results.length, succeeded, failed: results.length - succeeded, results },
    });
  } catch (error) {
    console.error("WORDPRESS PRODUCT SYNC TRIGGER ERROR:", error);
    return res.status(500).json({ success: false, message: "اجرای شناسایی خودکار محصولات ناموفق بود." });
  }
}
