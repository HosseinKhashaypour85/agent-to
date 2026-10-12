"use client";

import { useCallback, useEffect, useState } from "react";
import CustomerShell from "@/components/CustomerShell";
import { api } from "@/lib/api";
import { AlertCircle, Download, FileText, LoaderCircle, RefreshCw, Search } from "lucide-react";

type Invoice = {
  id: string;
  invoiceNumber: string;
  customerId?: string | null;
  externalOrderId?: string | null;
  status: "DRAFT" | "ISSUED" | "UNPAID" | "PARTIALLY_PAID" | "PAID" | "VOID" | "REFUNDED";
  currency: string;
  grandTotal: string | number;
  paidTotal: string | number;
  issuedAt?: string | null;
  createdAt: string;
  buyerSnapshot?: { name?: string; email?: string | null };
};

type InvoiceResponse = { success: boolean; data: Invoice[]; pagination?: { page: number; limit: number; total: number; totalPages: number }; message?: string };

const money = (value: string | number, currency: string) =>
  new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 2 }).format(Number(value) || 0) + " " + currency;

const statusLabels: Record<Invoice["status"], string> = {
  DRAFT: "پیش‌نویس",
  ISSUED: "صادرشده",
  UNPAID: "پرداخت‌نشده",
  PARTIALLY_PAID: "پرداخت جزئی",
  PAID: "پرداخت‌شده",
  VOID: "باطل‌شده",
  REFUNDED: "مستردشده",
};

export default function CustomerInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setError("");
    setRefreshing(true);
    try {
      const result = await api<InvoiceResponse>("/invoices?page=1&limit=100");
      if (!result?.success || !Array.isArray(result.data)) {
        throw new Error(result?.message || "پاسخ فاکتورها معتبر نیست.");
      }
      setInvoices(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "دریافت فاکتورها ناموفق بود.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = invoices.filter((invoice) => {
    const term = query.trim().toLocaleLowerCase();
    if (!term) return true;
    return [invoice.invoiceNumber, invoice.externalOrderId, invoice.buyerSnapshot?.name, invoice.buyerSnapshot?.email]
      .some((value) => String(value || "").toLocaleLowerCase().includes(term));
  });

  return (
    <CustomerShell>
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-bold text-[#10706B]">فروش و سفارش‌ها</p>
          <h1 className="text-2xl font-black">فاکتورهای فروش</h1>
          <p className="mt-2 text-sm text-[#7D8D89]">فاکتورهای ثبت‌شده برای کسب‌وکار شما از API دریافت می‌شوند.</p>
        </div>
        <button onClick={() => void load()} disabled={refreshing} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E2EAE6] bg-white px-4 py-3 text-sm font-bold disabled:opacity-60">
          {refreshing ? <LoaderCircle size={16} className="animate-spin"/> : <RefreshCw size={16}/>} تازه‌سازی
        </button>
      </div>

      {error && <div role="alert" className="mb-5 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"><AlertCircle size={18} className="mt-0.5 shrink-0"/><span>{error}</span></div>}

      <section className="overflow-hidden rounded-2xl border border-[#E3EBE7] bg-white">
        <div className="flex flex-col gap-3 border-b border-[#E9EFED] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div><h2 className="font-extrabold">فهرست فاکتورها</h2><p className="mt-1 text-xs text-[#899792]">تعداد: {new Intl.NumberFormat("fa-IR").format(filtered.length)}</p></div>
          <label className="flex items-center gap-2 rounded-xl border border-[#E2EAE6] px-3 py-2.5 sm:w-72"><Search size={16} className="text-[#8A9893]"/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="شماره فاکتور یا مشتری..." className="w-full text-sm outline-none"/></label>
        </div>
        {loading ? <div className="flex items-center justify-center gap-2 p-12 text-sm text-[#82908B]"><LoaderCircle size={18} className="animate-spin"/> دریافت فاکتورها از API...</div>
          : filtered.length === 0 ? <div className="flex flex-col items-center p-12 text-center"><FileText size={30} className="text-[#A4B1AC]"/><p className="mt-3 font-bold">{error ? "فاکتورها بارگذاری نشدند" : "هنوز فاکتوری ثبت نشده"}</p><p className="mt-1 text-sm text-[#899792]">{error ? "اتصال API را بررسی کن و دوباره تلاش کن." : "پس از ثبت سفارش و صدور فاکتور، سوابق اینجا نمایش داده می‌شوند."}</p></div>
          : <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-right text-sm"><thead className="bg-[#F8FAF9] text-xs text-[#788883]"><tr><th className="px-5 py-4 font-bold">شماره فاکتور</th><th className="px-5 py-4 font-bold">مشتری</th><th className="px-5 py-4 font-bold">تاریخ صدور</th><th className="px-5 py-4 font-bold">مبلغ نهایی</th><th className="px-5 py-4 font-bold">وضعیت</th><th className="px-5 py-4 font-bold">فایل</th></tr></thead><tbody className="divide-y divide-[#EDF1EF]">{filtered.map(invoice => <tr key={invoice.id} className="hover:bg-[#FAFCFB]"><td className="px-5 py-4 font-bold text-[#24514A]">{invoice.invoiceNumber}</td><td className="px-5 py-4"><span className="block font-semibold">{invoice.buyerSnapshot?.name || "—"}</span><span className="mt-1 block text-xs text-[#8A9792]">{invoice.buyerSnapshot?.email || invoice.customerId || "—"}</span></td><td className="px-5 py-4 text-[#687A74]">{invoice.issuedAt ? new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(new Date(invoice.issuedAt)) : "—"}</td><td className="px-5 py-4 font-bold">{money(invoice.grandTotal, invoice.currency)}</td><td className="px-5 py-4"><span className="rounded-full bg-[#EAF5F1] px-3 py-1.5 text-xs font-bold text-[#10706B]">{statusLabels[invoice.status] || invoice.status}</span></td><td className="px-5 py-4"><button disabled title="خروجی PDF در مرحله بعد اضافه می‌شود" className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold text-[#9AA5A1] disabled:cursor-not-allowed"><Download size={14}/> PDF</button></td></tr>)}</tbody></table></div>}
      </section>
    </CustomerShell>
  );
}
