"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import CustomerShell from "@/components/CustomerShell";
import { api } from "@/lib/api";
import { AlertCircle, ArrowLeft, Boxes, CheckCircle2, LoaderCircle, Package, Plus, RefreshCw, Search, Trash2, X } from "lucide-react";

type Product = {
  id: string;
  name: string;
  sku: string | null;
  description: string | null;
  price: number | string | null;
  currency: string;
  stock: number | null;
  stockStatus: "IN_STOCK" | "OUT_OF_STOCK" | "LOW_STOCK" | "UNKNOWN";
  category: string | null;
  imageUrl: string | null;
  productUrl: string | null;
  source: string;
  isActive: boolean;
  createdAt?: string;
};
type ProductResponse = { success: boolean; products: Product[]; pagination?: { page: number; limit: number; total: number; totalPages: number } };
type ProductForm = { name: string; sku: string; description: string; price: string; stock: string; category: string; productUrl: string };
const emptyForm: ProductForm = { name: "", sku: "", description: "", price: "", stock: "", category: "", productUrl: "" };
const fmt = (n: number | string | null, currency = "IRR") => n == null ? "—" : new Intl.NumberFormat("fa-IR").format(Number(n)) + (currency === "IRR" ? " ریال" : ` ${currency}`);
const stockLabel = (p: Product) => p.stockStatus === "IN_STOCK" ? "موجود" : p.stockStatus === "OUT_OF_STOCK" ? "ناموجود" : p.stockStatus === "LOW_STOCK" ? "رو به اتمام" : p.stock == null ? "نامشخص" : p.stock > 0 ? "موجود" : "ناموجود";
const stockStyle = (p: Product) => ["IN_STOCK","LOW_STOCK"].includes(p.stockStatus) || (p.stockStatus === "UNKNOWN" && (p.stock ?? 0) > 0) ? "bg-[#E7F5EF] text-[#16835D]" : p.stockStatus === "OUT_OF_STOCK" || p.stock === 0 ? "bg-[#FFF0F0] text-[#B42318]" : "bg-[#F1F3F2] text-[#84918D]";

export default function ProductCatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(page), limit: "100" });
      if (query.trim()) params.set("search", query.trim());
      if (category) params.set("category", category);
      const result = await api<ProductResponse>(`/agent/products?${params.toString()}`);
      setProducts(result.products || []);
      setTotal(result.pagination?.total ?? result.products?.length ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "دریافت محصولات ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }, [query, category, page]);

  useEffect(() => { void loadProducts(); }, [loadProducts]);

  const categories = useMemo(() => Array.from(new Set(products.map(p => p.category).filter((x): x is string => Boolean(x)))), [products]);
  const readyCount = products.filter(p => p.isActive).length;

  async function createProduct(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setError(""); setNotice("");
    const payload: Record<string, unknown> = {
      name: form.name.trim(),
      source: "MANUAL",
      sourceType: "MANUAL",
      isActive: true,
    };
    if (form.sku.trim()) payload.sku = form.sku.trim();
    if (form.description.trim()) payload.description = form.description.trim();
    if (form.category.trim()) payload.category = form.category.trim();
    if (form.productUrl.trim()) payload.productUrl = form.productUrl.trim();
    if (form.price.trim() && Number.isFinite(Number(form.price))) payload.price = Number(form.price);
    if (form.stock.trim() && Number.isFinite(Number(form.stock))) {
      payload.stock = Number(form.stock);
      payload.stockStatus = Number(form.stock) <= 0 ? "OUT_OF_STOCK" : Number(form.stock) <= 5 ? "LOW_STOCK" : "IN_STOCK";
    }
    try {
      await api("/agent/products", { method: "POST", body: JSON.stringify(payload) });
      setForm(emptyForm); setShowForm(false); setNotice("محصول با موفقیت در کاتالوگ ثبت شد.");
      await loadProducts();
    } catch (e) {
      setError(e instanceof Error ? e.message : "ثبت محصول ناموفق بود.");
    } finally { setBusy(false); }
  }

  async function deleteProduct(product: Product) {
    if (!window.confirm(`محصول «${product.name}» حذف شود؟`)) return;
    setError(""); setNotice("");
    try {
      await api(`/agent/products/${encodeURIComponent(product.id)}`, { method: "DELETE" });
      setNotice("محصول حذف شد.");
      await loadProducts();
    } catch (e) { setError(e instanceof Error ? e.message : "حذف محصول ناموفق بود."); }
  }

  return <CustomerShell>
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><p className="mb-2 text-xs font-bold text-[#10706B]">هوش محصول / کاتالوگ</p><h1 className="text-2xl font-black">کاتالوگ محصولات</h1><p className="mt-2 text-sm text-[#7D8D89]">این فهرست مستقیماً از API محصولات حساب شما دریافت می‌شود.</p></div>
      <div className="flex flex-wrap gap-2"><button onClick={()=>void loadProducts()} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#DDE7E2] bg-white px-4 py-3 text-sm font-bold text-[#536660]"><RefreshCw size={16}/> تازه‌سازی</button><button onClick={()=>setShowForm(v=>!v)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#10706B] px-4 py-3 text-sm font-bold text-white"><Plus size={16}/> ثبت محصول</button></div>
    </div>
    <div className="mb-5 grid gap-3 sm:grid-cols-3">
      <article className="rounded-2xl border border-[#E4EBE8] bg-white p-4"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#E8F4F0] text-[#10706B]"><Boxes size={18}/></span><p className="mt-3 text-xs text-[#87938F]">کل محصولات</p><b className="mt-1 block text-2xl">{total.toLocaleString("fa-IR")}</b></article>
      <article className="rounded-2xl border border-[#E4EBE8] bg-white p-4"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#E7F5EF] text-[#16835D]"><CheckCircle2 size={18}/></span><p className="mt-3 text-xs text-[#87938F]">محصولات فعال در نتایج فعلی</p><b className="mt-1 block text-2xl">{readyCount.toLocaleString("fa-IR")}</b></article>
      <article className="rounded-2xl border border-[#E4EBE8] bg-white p-4"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#F1F3F2] text-[#84918D]"><Package size={18}/></span><p className="mt-3 text-xs text-[#87938F]">دسته‌بندی در نتایج فعلی</p><b className="mt-1 block text-2xl">{categories.length.toLocaleString("fa-IR")}</b></article>
    </div>
    {error && <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-[#F3D4D4] bg-[#FFF6F6] p-4 text-sm text-[#A62B2B]"><AlertCircle size={18} className="mt-0.5 shrink-0"/><div className="flex-1"><p>{error}</p>{/401|نشست|وارد شوید|Authentication/i.test(error)&&<Link href="/customer-login" className="mt-2 inline-block font-bold underline">ورود به حساب مشتری</Link>}</div><button onClick={()=>setError("")} aria-label="بستن"><X size={16}/></button></div>}
    {notice && <div role="status" className="mb-4 rounded-xl border border-[#CBE7DB] bg-[#F0FAF5] p-3 text-sm text-[#176B4D]">{notice}</div>}
    {showForm&&<form onSubmit={createProduct} className="mb-5 rounded-2xl border border-[#DCEAE5] bg-white p-5 sm:p-6"><div className="mb-5 flex items-center justify-between"><div><h2 className="font-extrabold">ثبت محصول جدید</h2><p className="mt-1 text-xs text-[#87938F]">اطلاعات در API ذخیره می‌شود و به همین tenant تعلق دارد.</p></div><button type="button" onClick={()=>setShowForm(false)} aria-label="بستن فرم" className="rounded-lg p-2 hover:bg-[#F3F7F5]"><X size={18}/></button></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <label className="block"><span className="mb-2 block text-xs font-bold">نام محصول *</span><input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full rounded-xl border border-[#DDE7E2] px-3 py-3 text-sm outline-none focus:border-[#10706B]" placeholder="نام محصول"/></label>
      <label className="block"><span className="mb-2 block text-xs font-bold">SKU</span><input value={form.sku} onChange={e=>setForm({...form,sku:e.target.value})} className="w-full rounded-xl border border-[#DDE7E2] px-3 py-3 text-sm outline-none focus:border-[#10706B]" dir="ltr" placeholder="SKU-001"/></label>
      <label className="block"><span className="mb-2 block text-xs font-bold">دسته‌بندی</span><input value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="w-full rounded-xl border border-[#DDE7E2] px-3 py-3 text-sm outline-none focus:border-[#10706B]" placeholder="مثلاً الکترونیک"/></label>
      <label className="block"><span className="mb-2 block text-xs font-bold">قیمت (واحد پولی API)</span><input type="number" min="0" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} className="w-full rounded-xl border border-[#DDE7E2] px-3 py-3 text-sm outline-none focus:border-[#10706B]" placeholder="2500000"/></label>
      <label className="block"><span className="mb-2 block text-xs font-bold">موجودی</span><input type="number" min="0" value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})} className="w-full rounded-xl border border-[#DDE7E2] px-3 py-3 text-sm outline-none focus:border-[#10706B]" placeholder="10"/></label>
      <label className="block"><span className="mb-2 block text-xs font-bold">لینک محصول</span><input type="url" value={form.productUrl} onChange={e=>setForm({...form,productUrl:e.target.value})} className="w-full rounded-xl border border-[#DDE7E2] px-3 py-3 text-sm outline-none focus:border-[#10706B]" dir="ltr" placeholder="https://..."/></label>
      <label className="block sm:col-span-2 xl:col-span-3"><span className="mb-2 block text-xs font-bold">توضیحات</span><textarea rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} className="w-full rounded-xl border border-[#DDE7E2] px-3 py-3 text-sm outline-none focus:border-[#10706B]" placeholder="ویژگی‌ها و توضیحات محصول"/></label>
    </div><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={()=>setShowForm(false)} className="rounded-xl border border-[#DDE7E2] px-4 py-3 text-sm font-bold">انصراف</button><button disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-[#10706B] px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{busy&&<LoaderCircle size={16} className="animate-spin"/>}ذخیره محصول</button></div></form>}
    <section className="overflow-hidden rounded-2xl border border-[#E4EBE8] bg-white">
      <div className="flex flex-col gap-3 border-b border-[#EDF1EF] p-4 sm:flex-row sm:items-center"><div className="relative flex-1 sm:max-w-sm"><Search size={16} className="absolute right-3 top-3 text-[#87938F]"/><input value={query} onChange={e=>{setPage(1);setQuery(e.target.value)}} placeholder="جست‌وجوی نام یا SKU..." className="w-full rounded-xl border border-[#E1E9E5] py-2.5 pr-9 pl-3 text-xs outline-none focus:border-[#10706B]"/></div><select value={category} onChange={e=>{setPage(1);setCategory(e.target.value)}} className="rounded-xl border border-[#E1E9E5] bg-white px-3 py-2.5 text-xs sm:max-w-[220px]"><option value="">همه دسته‌بندی‌ها</option>{categories.map(x=><option key={x} value={x}>{x}</option>)}</select><span className="text-xs text-[#87938F]">نتایج واقعی API</span></div>
      {loading?<div className="flex items-center justify-center gap-2 p-14 text-sm text-[#7D8D89]"><LoaderCircle size={18} className="animate-spin"/> در حال دریافت محصولات...</div>:products.length===0?<div className="flex flex-col items-center p-12 text-center"><Package size={32} className="text-[#9AA7A2]"/><h3 className="mt-3 font-bold">محصولی پیدا نشد</h3><p className="mt-1 text-xs text-[#87938F]">محصول جدید ثبت کن یا فیلتر جست‌وجو رو تغییر بده.</p></div>:<div className="overflow-x-auto"><table className="w-full min-w-[850px] text-right text-xs"><thead className="bg-[#F8FAF9] text-[#84918D]"><tr>{["محصول","دسته‌بندی","قیمت","موجودی","منبع","وضعیت","عملیات"].map(x=><th key={x} className="px-5 py-3 font-semibold">{x}</th>)}</tr></thead><tbody>{products.map(p=><tr key={p.id} className="border-t border-[#EDF1EF] hover:bg-[#FBFDFC]"><td className="px-5 py-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#E8F4F0] text-[#10706B]"><Package size={18}/></span><span><b className="block text-[13px]">{p.name}</b><small className="mt-1 block text-[#98A39F]" dir="ltr">{p.sku||p.id}</small></span></div></td><td className="px-5 py-4">{p.category||"—"}</td><td className="px-5 py-4 whitespace-nowrap font-bold">{fmt(p.price,p.currency)}</td><td className="px-5 py-4">{p.stock==null?"—":p.stock.toLocaleString("fa-IR")}</td><td className="px-5 py-4">{p.source==="CUSTOM_API"?"API سفارشی":p.source==="WOOCOMMERCE"?"WooCommerce":p.source==="CUSTOM_ENDPOINT"?"Endpoint سفارشی":"ثبت دستی"}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${stockStyle(p)}`}>{stockLabel(p)}</span></td><td className="px-5 py-4"><button onClick={()=>void deleteProduct(p)} title="حذف محصول" aria-label={`حذف ${p.name}`} className="rounded-lg p-2 text-[#B42318] hover:bg-[#FFF0F0]"><Trash2 size={15}/></button></td></tr>)}</tbody></table></div>}
      <div className="flex flex-col gap-2 border-t border-[#EDF1EF] px-5 py-4 text-xs text-[#87938F] sm:flex-row sm:items-center sm:justify-between"><span>{total.toLocaleString("fa-IR")} محصول در API ثبت شده</span><Link href="/product-sources" className="inline-flex items-center gap-1 font-bold text-[#10706B]">اتصال منبع خارجی <ArrowLeft size={14}/></Link></div>
    </section>
    <p className="mt-4 text-[11px] leading-6 text-[#87938F]">قیمت با واحد پولی ذخیره‌شده در API نمایش داده می‌شود. اتصال و همگام‌سازی خودکار فروشگاه خارجی هنوز نیازمند پیاده‌سازی endpoint اختصاصی بک‌اند است.</p>
  </CustomerShell>;
}
