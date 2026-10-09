"use client";

import { useState } from "react";
import Link from "next/link";
import CustomerShell from "@/components/CustomerShell";
import { api } from "@/lib/api";
import { ArrowLeft, ArrowRight, CircleAlert, Database, Link2, LoaderCircle, RefreshCw, ShieldCheck, DownloadCloud, CheckCircle2 } from "lucide-react";

type ExternalProduct = {
  id: string | number;
  title?: string;
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  image?: string;
  imageUrl?: string;
  rating?: { rate?: number; count?: number };
  sku?: string;
  stock?: number;
};

function getProductName(product: ExternalProduct) {
  return product.title || product.name || "";
}

export default function ProductSourcesPage() {
  const [name, setName] = useState("Fake Store API");
  const [url, setUrl] = useState("https://fakestoreapi.com/products");
  const [auth, setAuth] = useState<"none" | "apiKey" | "bearer">("none");
  const [token, setToken] = useState("");
  const [products, setProducts] = useState<ExternalProduct[]>([]);
  const [tested, setTested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function testConnection() {
    setError("");
    setNotice("");
    setTested(false);
    setLoading(true);
    try {
      const parsed = new URL(url.trim());
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
        throw new Error("آدرس API معتبر نیست.");
      }
      const headers: Record<string, string> = { Accept: "application/json" };
      if (auth === "bearer" && token.trim()) headers.Authorization = `Bearer ${token.trim()}`;
      if (auth === "apiKey" && token.trim()) headers["x-api-key"] = token.trim();
      const response = await fetch(parsed.toString(), { method: "GET", headers, cache: "no-store" });
      if (!response.ok) throw new Error(`API پاسخ ${response.status} برگرداند.`);
      const data = await response.json();
      const list = Array.isArray(data) ? data : Array.isArray(data.products) ? data.products : Array.isArray(data.data) ? data.data : null;
      if (!list) throw new Error("ساختار پاسخ API آرایه محصولات نیست.");
      const valid = list.filter((item: ExternalProduct) => getProductName(item));
      setProducts(valid);
      setTested(true);
      setNotice(`اتصال موفق بود؛ ${valid.length} محصول دریافت شد.`);
    } catch (e) {
      setProducts([]);
      setError(e instanceof Error ? e.message : "اتصال به API ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }

  async function importProducts() {
    setError("");
    setNotice("");
    setImporting(true);
    let imported = 0;
    const failures: string[] = [];
    try {
      for (const product of products) {
        try {
          await api("/agent/products", {
            method: "POST",
            body: JSON.stringify({
              externalId: String(product.id),
              name: getProductName(product),
              description: product.description || "",
              price: typeof product.price === "number" ? product.price : undefined,
              currency: "USD",
              category: product.category || "",
              imageUrl: product.image || product.imageUrl || "",
              productUrl: "",
              sku: product.sku || `API-${product.id}`,
              stock: typeof product.stock === "number" ? product.stock : undefined,
              source: "CUSTOM_API",
              sourceType: "CUSTOM_API",
              rawData: product,
              isActive: true,
            }),
          });
          imported += 1;
        } catch (e) {
          failures.push(`${getProductName(product)}: ${e instanceof Error ? e.message : "خطا"}`);
        }
      }
      if (failures.length) {
        setNotice(`${imported} محصول از ${products.length} محصول وارد شد.`);
        setError(`ورود ${failures.length} محصول ناموفق بود. ممکن است دسترسی تکراری یا خطای API وجود داشته باشد. ${failures.slice(0, 2).join(" | ")}`);
      } else {
        setNotice(`${imported} محصول با موفقیت در کاتالوگ حساب شما ذخیره شد.`);
      }
    } finally {
      setImporting(false);
    }
  }

  return <CustomerShell>
    <div className="mb-7">
      <Link href="/customer-dashboard" className="mb-4 inline-flex items-center gap-2 text-xs font-semibold text-[#7D8D89] hover:text-[#10706B]"><ArrowRight size={15}/> بازگشت به داشبورد</Link>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div><p className="mb-2 text-xs font-bold text-[#10706B]">کاتالوگ هوشمند / منابع</p><h1 className="text-2xl font-black">اتصال منبع محصولات</h1><p className="mt-2 text-sm text-[#7D8D89]">محصولات را از API دریافت و در کاتالوگ حساب خود ذخیره کن.</p></div>
        <span className="inline-flex items-center gap-2 rounded-full border border-[#DCEAE6] bg-white px-3 py-2 text-xs text-[#6D7E79]"><ShieldCheck size={15} className="text-[#10706B]"/> اتصال مستقیم به API</span>
      </div>
    </div>

    <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
      <section className="rounded-2xl border border-[#E4EBE8] bg-white p-5 sm:p-7">
        <div className="mb-5 flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#E8F4F0] text-[#10706B]"><Link2 size={20}/></span><div><h2 className="font-extrabold">تنظیم اتصال API</h2><p className="mt-1 text-xs text-[#87938F]">آدرس پیش‌فرض روی Fake Store API تنظیم شده است.</p></div></div>
        <div className="space-y-4">
          <label className="block"><span className="mb-2 block text-xs font-bold">نام منبع</span><input value={name} onChange={e=>setName(e.target.value)} className="w-full rounded-xl border border-[#DDE6E2] px-4 py-3 text-sm outline-none focus:border-[#10706B]" placeholder="مثلاً فروشگاه اصلی"/></label>
          <label className="block"><span className="mb-2 block text-xs font-bold">آدرس API محصولات</span><input dir="ltr" value={url} onChange={e=>{setUrl(e.target.value);setTested(false);setProducts([]);}} className="w-full rounded-xl border border-[#DDE6E2] px-4 py-3 text-left text-sm outline-none focus:border-[#10706B]" placeholder="https://fakestoreapi.com/products" required type="url"/></label>
          <label className="block"><span className="mb-2 block text-xs font-bold">روش احراز هویت API منبع</span><select value={auth} onChange={e=>setAuth(e.target.value as "none" | "apiKey" | "bearer")} className="w-full rounded-xl border border-[#DDE6E2] bg-white px-4 py-3 text-sm"><option value="none">بدون احراز هویت</option><option value="apiKey">API Key (هدر x-api-key)</option><option value="bearer">Bearer Token</option></select></label>
          {auth !== "none" && <label className="block"><span className="mb-2 block text-xs font-bold">کلید دسترسی API منبع</span><input type="password" value={token} onChange={e=>setToken(e.target.value)} className="w-full rounded-xl border border-[#DDE6E2] px-4 py-3 text-sm outline-none focus:border-[#10706B]" placeholder="کلید دسترسی" autoComplete="off"/></label>}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={()=>void testConnection()} disabled={loading || !url.trim()} className="inline-flex items-center gap-2 rounded-xl bg-[#10706B] px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{loading?<LoaderCircle size={16} className="animate-spin"/>:<RefreshCw size={16}/>} {loading?"در حال اتصال...":"تست اتصال و دریافت محصولات"}</button>
          {tested && products.length > 0 && <button onClick={()=>void importProducts()} disabled={importing} className="inline-flex items-center gap-2 rounded-xl border border-[#BFDCD3] px-5 py-3 text-sm font-bold text-[#10706B] disabled:opacity-60">{importing?<LoaderCircle size={16} className="animate-spin"/>:<DownloadCloud size={16}/>} {importing?"در حال ذخیره...":"وارد کردن به کاتالوگ"}</button>}
        </div>
        {error && <p role="alert" className="mt-4 flex items-start gap-2 rounded-xl bg-[#FFF1F1] p-3 text-xs leading-6 text-[#A62B2B]"><CircleAlert size={15} className="mt-1 shrink-0"/>{error}</p>}
        {notice && <p role="status" className="mt-4 flex items-start gap-2 rounded-xl bg-[#EFF9F4] p-3 text-xs leading-6 text-[#176B4D]"><CheckCircle2 size={15} className="mt-1 shrink-0"/>{notice}</p>}
        {tested && <div className="mt-6">
          <div className="mb-3 flex items-center justify-between"><h3 className="font-extrabold">پیش‌نمایش محصولات واقعی API</h3><span className="rounded-full bg-[#E8F4F0] px-3 py-1 text-xs font-bold text-[#10706B]">{products.length} محصول</span></div>
          {products.length === 0 ? <p className="rounded-xl bg-[#F7FAF8] p-4 text-sm text-[#7D8D89]">این API محصولی برنگرداند.</p> : <div className="overflow-x-auto rounded-xl border border-[#E4EBE8]"><table className="w-full min-w-[600px] text-right text-xs"><thead className="bg-[#F7FAF8] text-[#7D8D89]"><tr><th className="px-4 py-3">محصول</th><th className="px-4 py-3">شناسه API</th><th className="px-4 py-3">دسته‌بندی</th><th className="px-4 py-3">قیمت</th></tr></thead><tbody>{products.map((p,i)=><tr key={String(p.id ?? i)} className="border-t border-[#EDF1EF]"><td className="px-4 py-3 font-bold">{getProductName(p)}</td><td dir="ltr" className="px-4 py-3">{p.id}</td><td className="px-4 py-3">{p.category || "—"}</td><td className="px-4 py-3 whitespace-nowrap">{typeof p.price === "number" ? new Intl.NumberFormat("fa-IR").format(p.price) + " USD" : "—"}</td></tr>)}</tbody></table></div>}
        </div>}
      </section>
      <aside className="space-y-4">
        <div className="rounded-2xl border border-[#E4EBE8] bg-white p-5"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#E8F4F0] text-[#10706B]"><Database size={19}/></span><h3 className="mt-4 font-extrabold">ذخیره در کاتالوگ</h3><p className="mt-2 text-xs leading-6 text-[#7D8D89]">بعد از دریافت محصولات، با دکمه ورود به کاتالوگ، محصولات در API بک‌اند و در حساب مشتری ذخیره می‌شوند. برای ذخیره‌سازی باید وارد پنل شده باشی.</p></div>
        <div className="rounded-2xl border border-[#E4EBE8] bg-white p-5"><h3 className="font-extrabold">محدودیت Fake Store API</h3><p className="mt-2 text-xs leading-6 text-[#7D8D89]">این سرویس آزمایشی است. اطلاعات دریافتی واقعی است، اما خود سرویس خارجی تضمین ذخیره دائمی تغییرات را نمی‌دهد. محصولات واردشده به کاتالوگ Agent-To در دیتابیس بک‌اند شما ذخیره می‌شوند.</p></div>
      </aside>
    </div>
  </CustomerShell>;
}
