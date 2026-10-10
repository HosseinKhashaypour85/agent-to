import { Request, Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { importProducts } from "./agent-products-import.service";

export async function importProductsController(req: AuthRequest, res: Response) {
  try {
    if (!req.user?.tenantId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const result = await importProducts(req.user.tenantId, req.body || {});
    return res.status(200).json({
      success: true,
      message: "Product import completed",
      data: result,
    });
  } catch (error: any) {
    const message = typeof error?.message === "string" ? error.message : "PRODUCT_IMPORT_FAILED";
    const clientErrors: Record<string, string> = {
      API_URL_REQUIRED: "آدرس API را وارد کنید.",
      INVALID_API_URL: "آدرس API معتبر نیست.",
      API_URL_MUST_USE_HTTPS: "آدرس منبع باید با HTTPS شروع شود.",
      API_URL_NOT_PUBLIC: "آدرس API باید یک دامنه عمومی باشد.",
      API_URL_DOMAIN_REQUIRED: "برای امنیت، آدرس API باید با دامنه وارد شود.",
      INVALID_API_KEY_HEADER: "نام هدر API Key معتبر نیست.",
      SOURCE_API_INVALID_JSON: "پاسخ API منبع، JSON معتبر نیست.",
      NO_PRODUCTS_FOUND: "هیچ محصولی در منبع پیدا نشد.",
      PRODUCTS_ARRAY_REQUIRED: "فهرست محصولات فایل معتبر نیست.",
      IMPORT_LIMIT_EXCEEDED: "در هر بار حداکثر ۲۰۰۰ محصول می‌توان وارد کرد.",
      INVALID_IMPORT_MODE: "روش واردسازی معتبر نیست.",
    };
    if (message.startsWith("PRODUCT_NAME_REQUIRED_AT_ROW_")) {
      return res.status(400).json({ success: false, message: `نام محصول در ردیف ${message.split("_").at(-1)} خالی است.` });
    }
    if (clientErrors[message]) {
      return res.status(400).json({ success: false, message: clientErrors[message] });
    }
    if (message.startsWith("SOURCE_API_HTTP_")) {
      const status = Number(message.replace("SOURCE_API_HTTP_", ""));
      return res.status(502).json({ success: false, message: `API منبع با وضعیت ${status} پاسخ داد.` });
    }
    console.error("IMPORT AGENT PRODUCTS ERROR:", error);
    return res.status(500).json({ success: false, message: "واردسازی محصولات ناموفق بود." });
  }
}
