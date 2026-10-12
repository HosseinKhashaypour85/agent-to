import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { getInvoice, listInvoices } from "./invoice.service";

export async function list(req: AuthRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) {
    return res.status(403).json({ success: false, message: "Tenant access required" });
  }

  try {
    const data = await listInvoices(tenantId, {
      page: req.query.page,
      limit: req.query.limit,
      status: req.query.status,
      customerId: req.query.customerId,
      siteId: req.query.siteId,
    });
    return res.status(200).json({ success: true, data: data.rows, pagination: data.pagination });
  } catch (error: any) {
    if (error?.message === "INVALID_INVOICE_STATUS") {
      return res.status(400).json({ success: false, message: "Invalid invoice status" });
    }
    console.error("LIST INVOICES ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to list invoices" });
  }
}

export async function getOne(req: AuthRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) {
    return res.status(403).json({ success: false, message: "Tenant access required" });
  }

  try {
    const invoice = await getInvoice(tenantId, String(req.params.id));
    return res.status(200).json({ success: true, data: invoice });
  } catch (error: any) {
    if (error?.message === "INVOICE_NOT_FOUND") {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }
    console.error("GET INVOICE ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to get invoice" });
  }
}
