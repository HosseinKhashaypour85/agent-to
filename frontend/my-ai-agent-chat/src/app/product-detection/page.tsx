"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import CustomerShell from "@/components/CustomerShell";
import { api } from "@/lib/api";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Globe,
  LoaderCircle,
  PackageCheck,
  RefreshCw,
  SearchCheck,
  ShieldCheck,
  XCircle,
} from "lucide-react";

type Product = {
  id: string;
  name: string;
  source?: string;
  sourceType?: string;
  lastSyncedAt?: string | null;
  updatedAt?: string;
  productUrl?: string | null;
};

type ProductResponse = {
  success?: boolean;
  products?: Product[];
  pagination?: { total?: number };
};

type SyncResult = {
  siteId: string;
  domain: string;
  success: boolean;
  status?: number;
  message: string;
};

type SyncResponse = {
  success: boolean;
  message: string;
  data?: {
    attempted: number;
    succeeded: number;
    failed: number;
    results: SyncResult[];
  };
};

const fa = (value: number) => new Intl.NumberFormat("fa-IR").format(value);
const isAutoSource = (product: Product) =>
  ["WOOCOMMERCE", "CUSTOM_ENDPOINT"].includes(String(product.sourceType || product.source || "").toUpperCase());

export default function ProductDetectionPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productTotal, setProductTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [results, setResults] = useState<SyncResult[]>([]);
  const [lastChecked, setLastChecked] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api<ProductResponse>("/agent/products?page=1&limit=100");
      setProducts(response.products ?? []);
      setProductTotal(response.pagination?.total ?? response.products?.length ?? 0);
      setLastChecked(new Date().toISOString());
    } catch (e) {
      setError(e instanceof Error ? e.message : "دریافت وضعیت کاتالوگ ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadProducts(); }, [loadProducts]);

  const autoProducts = products.filter(isAutoSource);
  const latestSync = autoProducts
    .map((product) => product.lastSyncedAt)
    .filter((value): value is string => Boolean(value))
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];

  async function startDetection() {
    setSyncing(true);
    setError("");
    setNotice("");
    setResults([]);
    try {
      const response = await api<SyncResponse>("/agent/products/sync-wordpress", {
        method: "POST",
        body: JSON.stringify({}),
      });
      setResults(response.data?.results ?? []);
      if (response.success && (response.data?.succeeded ?? 0) > 0) {
        setNotice(response.message || "درخواست شناسایی محصولات ارسال شد.");
      } else {
        setError(response.message || "هیچ سایت وردپرسی آماده همگام‌سازی پیدا نشد.");
      }
      await loadProducts();
    } catch (e) {
      setError(e instanceof Error ? e.message : "اجرای شناسایی خودکار ناموفق بود.");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <CustomerShell>
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Link href="/product-sources" className="mb-4 inline-flex items-center gap-2 text-xs font-semibold text-[#7D8D89] hover:text-[#10706B]">
            <ArrowLeft size={14} /> منابع محصولات
          </Link>
          <p className="mb-2 text-xs font-bold text-[#10706B]">هوش محصول / اتوماسیون</p>
          <h1 className="text-2xl font-black text-[#163633]">شناسایی خودکار محصولات</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[#7D8D89]">
            محصولات سایت‌های وردپرسی متصل را با افزونه Agent-To شناسایی کن و اطلاعاتشان را به کاتالوگ همگام‌سازی کن.
          </p>
        </div>
        <button
          onClick={() => void startDetection()}
          disabled={syncing}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#10706B] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#0B5B57] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {syncing ? <LoaderCircle size={17} className="animate-spin" /> : <SearchCheck size={17} />}
          {syncing ? "در حال شناسایی..." : "شروع شناسایی همین الان"}
        </button>
      </div>

      {error && <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-800"><AlertCircle size={18} className="mt-1 shrink-0" /><span className="flex-1">{error}</span><button onClick={() => setError("")} aria-label="بستن"><XCircle size={16} /></button></div>}
      {notice && <div role="status" className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-800"><CheckCircle2 size={18} className="mt-1 shrink-0" /><span>{notice}</span></div>}

      <section className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-[#E4EBE8] bg-white p-5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#E8F4F0] text-[#10706B]"><Globe size={19} /></span>
          <p className="mt-4 text-xs text-[#87938F]">سایت‌های بررسی‌شده در آخرین اجرا</p>
          <b className="mt-1 block text-2xl">{results.length ? fa(results.length) : "—"}</b>
        </article>
        <article className="rounded-2xl border border-[#E4EBE8] bg-white p-5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#E7F5EF] text-[#16835D]"><CheckCircle2 size={19} /></span>
          <p className="mt-4 text-xs text-[#87938F]">اتصال‌های موفق در آخرین اجرا</p>
          <b className="mt-1 block text-2xl">{results.length ? fa(results.filter((item) => item.success).length) : "—"}</b>
        </article>
        <article className="rounded-2xl border border-[#E4EBE8] bg-white p-5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#E8F4F0] text-[#10706B]"><PackageCheck size={19} /></span>
          <p className="mt-4 text-xs text-[#87938F]">محصولات شناسایی‌شده در فهرست اخیر</p>
          <b className="mt-1 block text-2xl">{loading ? "…" : fa(autoProducts.length)}</b>
        </article>
        <article className="rounded-2xl border border-[#E4EBE8] bg-white p-5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#F1F3F2] text-[#84918D]"><Clock3 size={19} /></span>
          <p className="mt-4 text-xs text-[#87938F]">آخرین زمان همگام‌سازی ثبت‌شده</p>
          <b className="mt-2 block text-sm">{latestSync ? new Date(latestSync).toLocaleString("fa-IR") : "هنوز ثبت نشده"}</b>
        </article>
      </section>

      <section className="mb-5 rounded-2xl border border-[#DCEAE5] bg-white p-5 sm:p-7">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#E8F4F0] text-[#10706B]"><ShieldCheck size={21} /></span>
          <div className="min-w-0 flex-1">
            <h2 className="font-extrabold text-[#163633]">فرایند شناسایی خودکار</h2>
            <p className="mt-2 text-sm leading-7 text-[#6F817C]">برای سایت وردپرسی، افزونه Agent-To باید نصب و به همین حساب متصل باشد و گزینه تشخیص خودکار محصولات در تنظیمات افزونه فعال بماند.</p>
            <ol className="mt-4 grid gap-3 sm:grid-cols-3">
              <li className="rounded-xl bg-[#F7FAF9] p-4"><b className="text-sm">۱. اتصال سایت</b><p className="mt-2 text-xs leading-6 text-[#7D8D89]">افزونه را از تنظیمات وردپرس به Agent-To متصل کن.</p></li>
              <li className="rounded-xl bg-[#F7FAF9] p-4"><b className="text-sm">۲. شناسایی و ارسال</b><p className="mt-2 text-xs leading-6 text-[#7D8D89]">با دکمه بالا فرایند را اجرا کن؛ همگام‌سازی دوره‌ای نیز هر ۱۵ دقیقه انجام می‌شود.</p></li>
              <li className="rounded-xl bg-[#F7FAF9] p-4"><b className="text-sm">۳. بررسی کاتالوگ</b><p className="mt-2 text-xs leading-6 text-[#7D8D89]">نام، قیمت، SKU، تصویر و لینک محصولات را در کاتالوگ بررسی کن.</p></li>
            </ol>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/product-catalog" className="inline-flex items-center gap-2 rounded-xl border border-[#DDE7E2] px-4 py-2.5 text-sm font-bold text-[#536660] hover:bg-[#F7FAF9]">مشاهده کاتالوگ <ArrowLeft size={15} /></Link>
              <button onClick={() => void loadProducts()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-[#DDE7E2] px-4 py-2.5 text-sm font-bold text-[#536660] hover:bg-[#F7FAF9] disabled:opacity-50">{loading ? <LoaderCircle size={15} className="animate-spin" /> : <RefreshCw size={15} />} بررسی آخرین وضعیت</button>
            </div>
          </div>
        </div>
      </section>

      {results.length > 0 && <section className="mb-5 overflow-hidden rounded-2xl border border-[#E4EBE8] bg-white">
        <div className="border-b border-[#EDF1EF] px-5 py-4"><h2 className="font-extrabold">نتیجه آخرین اجرا</h2><p className="mt-1 text-xs text-[#87938F]">سایت‌هایی که افزونه پاسخ داده یا نیاز به بررسی دارند.</p></div>
        <div className="divide-y divide-[#EDF1EF]">
          {results.map((item) => <div key={item.siteId} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center">
            <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${item.success ? "bg-[#E7F5EF] text-[#16835D]" : "bg-rose-50 text-rose-600"}`}>{item.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}</span>
            <div className="min-w-0 flex-1"><b className="block text-sm" dir="ltr">{item.domain}</b><p className="mt-1 text-xs leading-5 text-[#7D8D89]">{item.message}</p></div>
            <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${item.success ? "bg-[#E7F5EF] text-[#16835D]" : "bg-rose-50 text-rose-600"}`}>{item.success ? "متصل" : "نیازمند بررسی"}</span>
          </div>)}
        </div>
      </section>}

      <section className="rounded-2xl border border-[#E4EBE8] bg-white p-5">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div><h2 className="font-extrabold">وضعیت کاتالوگ</h2><p className="mt-1 text-xs text-[#87938F]">در مجموع {fa(productTotal)} محصول در کاتالوگ حساب ثبت شده است.</p></div>
          <span className="text-xs text-[#87938F]">{lastChecked ? `آخرین بررسی پنل: ${new Date(lastChecked).toLocaleTimeString("fa-IR")}` : ""}</span>
        </div>
        {loading ? <div className="py-8 text-center text-sm text-[#7D8D89]"><LoaderCircle className="mx-auto mb-2 animate-spin" size={20} />در حال بررسی...</div> : autoProducts.length === 0 ? <div className="py-8 text-center"><PackageCheck className="mx-auto mb-3 text-[#A4B0AC]" size={25} /><p className="text-sm font-bold">هنوز محصول همگام‌شده‌ای در ۱۰۰ محصول اخیر پیدا نشد.</p><p className="mt-2 text-xs leading-6 text-[#87938F]">سایت وردپرسی را متصل کن و شناسایی خودکار را اجرا کن. ممکن است محصولات قدیمی‌تر از فهرست اخیر باشند.</p></div> : <div className="mt-4 divide-y divide-[#EDF1EF]">{autoProducts.slice(0, 8).map((product) => <div key={product.id} className="flex items-center gap-3 py-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#E8F4F0] text-[#10706B]"><PackageCheck size={17} /></span><div className="min-w-0 flex-1"><b className="block truncate text-sm">{product.name}</b><p className="mt-1 text-xs text-[#87938F]">{product.sourceType || product.source || "منبع خودکار"}</p></div>{product.productUrl && <a href={product.productUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-[#10706B]">مشاهده محصول</a>}</div>)}</div>}
      </section>
    </CustomerShell>
  );
}
