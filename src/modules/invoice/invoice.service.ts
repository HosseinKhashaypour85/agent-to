import Invoice, { InvoiceStatus } from "../../models/Invoice";

const allowedStatuses = new Set<InvoiceStatus>([
  "DRAFT", "ISSUED", "UNPAID", "PARTIALLY_PAID", "PAID", "VOID", "REFUNDED",
]);

export async function listInvoices(
  tenantId: string,
  options: { page?: unknown; limit?: unknown; status?: unknown; customerId?: unknown; siteId?: unknown }
) {
  const pageValue = Number(options.page ?? 1);
  const limitValue = Number(options.limit ?? 20);
  const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;
  const limit = Number.isInteger(limitValue) && limitValue > 0 ? Math.min(limitValue, 100) : 20;
  const where: any = { tenantId };

  if (typeof options.status === "string" && options.status.trim()) {
    const status = options.status.trim().toUpperCase() as InvoiceStatus;
    if (!allowedStatuses.has(status)) throw new Error("INVALID_INVOICE_STATUS");
    where.status = status;
  }
  if (typeof options.customerId === "string" && options.customerId.trim()) {
    where.customerId = options.customerId.trim();
  }
  if (typeof options.siteId === "string" && options.siteId.trim()) {
    where.siteId = options.siteId.trim();
  }

  const result = await Invoice.findAndCountAll({
    where,
    order: [["createdAt", "DESC"]],
    limit,
    offset: (page - 1) * limit,
  });

  return {
    rows: result.rows,
    pagination: { page, limit, total: result.count, totalPages: Math.ceil(result.count / limit) },
  };
}

export async function getInvoice(tenantId: string, invoiceId: string) {
  const invoice = await Invoice.findOne({ where: { id: invoiceId, tenantId } });
  if (!invoice) throw new Error("INVOICE_NOT_FOUND");
  return invoice;
}
