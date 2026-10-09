"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import CustomerShell from "@/components/CustomerShell";
import { api } from "@/lib/api";
import { AlertCircle, ArrowLeft, Boxes, Database, LoaderCircle, RefreshCw } from "lucide-react";

type Product = { id: string; name: string; sku?: string | null; category?: string | null; price?: number | string | null; stock?: number | null; isActive?: boolean };
type ProductResult = { success?: boolean; products?: Product[]; pagination?: { total?: number } };

export default function ProductSourcesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const result = await api<ProductResult>("/agent/products?page=1&limit=100");
      setProducts(result.products ?? []);
      setTotal(result.pagination?.total ?? result.products?.length ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "دریافت کاتالوگ ناموفق بود.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return <CustomerShell>
    <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div><p className="mb-2 text-xs font-bold text-[#10706B]">کاتالوگ هوشمند / منابع</p><h1 className="text-2xl font-black">منابع و محصولات</h1><p className="mt-2 text-sm text-[#7D8D89]">فهرست زیر از API محصولات همین کسب‌وکار خوانده می‌شود؛ داده آزمایشی نمایش داده نمی‌شود.</p></div>
      <button onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-3 text-sm font-bold disabled:opacity-50">{loading ? <LoaderCircle size={16} className="animate-spin"/> : <RefreshCw size={16}/>} بروزرسانی</button>
    </div>
    {error && <div role="alert" className="mb-4 flex gap-2 rounded-xl bg-rose-50 p-4 text-sm text-rose-700"><AlertCircle size={18}/>{error}</div>}
    <section className="mb-5 grid gap-4 sm:grid-cols-2"><article className="rounded-2xl border border-[#E4EBE8] bg-white p-5"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#E8F4F0] text-[#10706B]"><Boxes size={19}/></span><p className="mt-4 text-xs text-[#87938F]">محصولات ثبت‌شده</p><b className="mt-1 block text-2xl">{new Intl.NumberFormat("fa-IR").format(total)}</b></article><article className="rounded-2xl border border-[#E4EBE8] bg-white p-5"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#E8F4F0] text-[#10706B]"><Database size={19}/></span><p className="mt-4 text-xs text-[#87938F]">منبع داده</p><b className="mt-1 block text-lg">کاتالوگ API</b><p className="mt-1 text-xs text-[#87938F]">فقط اطلاعات موجود در بک‌اند</p></article></section>
    <section className="overflow-hidden rounded-2xl border border-[#E4EBE8] bg-white"><div className="flex items-center justify-between border-b border-[#EDF1EF] px-5 py-4"><div><h2 className="font-extrabold">محصولات</h2><p className="mt-1 text-xs text-[#87938F]">برای افزودن یا ویرایش محصول، از کاتالوگ استفاده کن.</p></div><Link href="/product-catalog" className="flex items-center gap-1 text-xs font-bold text-[#10706B]">مدیریت کاتالوگ <ArrowLeft size={14}/></Link></div>
      {loading && !products.length ? <div className="p-10 text-center text-sm text-slate-500"><LoaderCircle className="mx-auto mb-2 animate-spin" size={20}/>در حال دریافت محصولات...</div> : !products.length ? <p className="p-10 text-center text-sm text-[#87938F]">محصولی در API ثبت نشده است.</p> : <div className="divide-y divide-[#EDF1EF]">{products.map(p=><div key={p.id} className="flex items-center gap-3 px-5 py-4"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#E8F4F0] text-[#10706B]"><Boxes size={18}/></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{p.name}</p><p className="mt-1 text-xs text-[#87938F]">{p.sku || "بدون SKU"}{p.category ? " · " + p.category : ""}</p></div><span className="text-xs text-[#87938F]">{p.stock == null ? "موجودی نامشخص" : "موجودی: " + new Intl.NumberFormat("fa-IR").format(p.stock)}</span></div>)}</div>}
    </section>
    <div className="mt-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-900"><AlertCircle className="mt-1 shrink-0" size={19}/><p>اتصال واقعی منبع خارجی (URL/API/CSV/JSON) هنوز در بک‌اند پیاده‌سازی نشده است. این صفحه دیگر تست اتصال یا واردسازی نمایشی را موفق نشان نمی‌دهد؛ برای فعال‌کردن آن باید endpoint واردسازی و ذخیره امن credentialها اضافه شود.</p></div>
  </CustomerShell>;
}
