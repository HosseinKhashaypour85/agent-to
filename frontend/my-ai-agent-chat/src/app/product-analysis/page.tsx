"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import CustomerShell from "@/components/CustomerShell";
import { api } from "@/lib/api";
import { AlertCircle, ArrowLeft, Boxes, CheckCircle2, LoaderCircle, RefreshCw } from "lucide-react";

type Product = { id: string; name: string; sku?: string | null; category?: string | null; isActive?: boolean; createdAt?: string };
type ProductResponse = { success?: boolean; products?: Product[]; pagination?: { total?: number }; data?: Product[] };

const numberFa = (v: number) => new Intl.NumberFormat("fa-IR").format(v);

export default function ProductAnalysisPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const result = await api<ProductResponse>("/agent/products?page=1&limit=100");
      const list = result.products ?? result.data ?? [];
      setProducts(list);
      setTotal(result.pagination?.total ?? list.length);
    } catch (e) {
      setError(e instanceof Error ? e.message : "دریافت کاتالوگ ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);
  const active = products.filter(p => p.isActive !== false).length;

  return <CustomerShell>
    <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div><p className="mb-2 text-xs font-bold text-[#10706B]">هوش محصول / تحلیل</p><h1 className="text-2xl font-black">وضعیت کاتالوگ محصولات</h1><p className="mt-2 text-sm text-[#7D8D89]">این صفحه فقط اطلاعات واقعی برگشتی از API را نشان می‌دهد؛ مراحل تحلیل اجرا نشده به‌عنوان فعال نمایش داده نمی‌شوند.</p></div>
      <button onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-3 text-sm font-bold disabled:opacity-50">{loading ? <LoaderCircle size={16} className="animate-spin"/> : <RefreshCw size={16}/>} بروزرسانی</button>
    </div>
    {error && <div role="alert" className="mb-4 flex gap-2 rounded-xl bg-rose-50 p-4 text-sm text-rose-700"><AlertCircle size={18}/>{error}</div>}
    {loading && !products.length ? <div className="rounded-2xl border bg-white p-12 text-center text-sm text-slate-500"><LoaderCircle className="mx-auto mb-3 animate-spin" size={22}/>در حال دریافت کاتالوگ...</div> : <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[{label:"کل محصولات",value:total,icon:Boxes},{label:"محصولات فعال",value:active,icon:CheckCircle2},{label:"محصولات غیرفعال",value:Math.max(0,products.length-active),icon:AlertCircle}].map(item=>{const Icon=item.icon;return <article key={item.label} className="rounded-2xl border border-[#E4EBE8] bg-white p-5"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#E8F4F0] text-[#10706B]"><Icon size={19}/></span><p className="mt-4 text-xs text-[#87938F]">{item.label}</p><b className="mt-1 block text-2xl">{numberFa(item.value)}</b></article>})}
      </section>
      <section className="mt-5 overflow-hidden rounded-2xl border border-[#E4EBE8] bg-white">
        <div className="flex items-center justify-between border-b border-[#EDF1EF] px-5 py-4"><div><h2 className="font-extrabold">محصولات دریافت‌شده از API</h2><p className="mt-1 text-xs text-[#87938F]">برای بررسی جزئیات و ویرایش، وارد کاتالوگ شو.</p></div><Link href="/product-catalog" className="flex items-center gap-1 text-xs font-bold text-[#10706B]">مدیریت کاتالوگ <ArrowLeft size={14}/></Link></div>
        {!products.length ? <p className="p-8 text-center text-sm text-[#87938F]">API محصولی برنگرداند.</p> : <div className="divide-y divide-[#EDF1EF]">{products.slice(0,10).map(p=><div key={p.id} className="flex items-center gap-3 px-5 py-4"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#E8F4F0] text-[#10706B]"><Boxes size={18}/></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{p.name}</p><p className="mt-1 text-xs text-[#87938F]">{p.sku || "بدون SKU"}{p.category ? " · " + p.category : ""}</p></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${p.isActive === false ? "bg-slate-100 text-slate-500" : "bg-[#E7F5EF] text-[#16835D]"}`}>{p.isActive === false ? "غیرفعال" : "فعال"}</span></div>)}</div>}
      </section>
    </>}
  </CustomerShell>;
}
