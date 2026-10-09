"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import CustomerShell from "@/components/CustomerShell";
import { api } from "@/lib/api";
import { Activity, AlertCircle, ArrowLeft, Bot, Boxes, LoaderCircle, MessageSquareText, RefreshCw, Sparkles, Users } from "lucide-react";

type Product = { id: string; name: string; isActive?: boolean; source?: string; createdAt?: string };
type Customer = { id: string; firstName?: string | null; lastName?: string | null; createdAt?: string };
type Conversation = { id: string; status?: string; createdAt?: string; channel?: string };
type Agent = { id?: string; name?: string; isActive?: boolean; status?: string };
type Usage = { summary?: { aiMessages?: number; inputTokens?: number; outputTokens?: number; totalTokens?: number; requests?: number } };
type DashboardData = { products: Product[]; productsTotal: number; customers: Customer[]; conversations: Conversation[]; agent: Agent | null; usage: Usage | null };
const numberFa = (v: number) => new Intl.NumberFormat("fa-IR").format(Number.isFinite(v) ? v : 0);
const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0);

export default function CustomerDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    const [products, customers, conversations, agent, usage] = await Promise.allSettled([
      api<any>("/agent/products?page=1&limit=100"),
      api<any>("/customers"),
      api<any>("/conversations"),
      api<any>("/agent"),
      api<any>("/usage/me"),
    ]);
    const failed = [products, customers, conversations, agent, usage].filter(x => x.status === "rejected");
    const unwrapList = (result: PromiseSettledResult<any>, keys: string[] = []) => {
      if (result.status !== "fulfilled") return [];
      const v = result.value;
      for (const key of keys) if (Array.isArray(v?.[key])) return v[key];
      if (Array.isArray(v?.data)) return v.data;
      if (Array.isArray(v?.data?.rows)) return v.data.rows;
      if (Array.isArray(v?.products)) return v.products;
      if (Array.isArray(v?.data?.products)) return v.data.products;
      return [];
    };
    const agentResult = agent.status === "fulfilled" ? (agent.value?.agent ?? agent.value?.data?.agent ?? agent.value?.data ?? null) : null;
    const usageResult = usage.status === "fulfilled" && usage.value?.success ? usage.value.data : null;
    setData({
      products: unwrapList(products, ["products"]),
      productsTotal: products.status === "fulfilled" ? Number(products.value?.pagination?.total ?? products.value?.total ?? unwrapList(products, ["products"]).length) : 0,
      customers: unwrapList(customers),
      conversations: unwrapList(conversations),
      agent: agentResult,
      usage: usageResult,
    });
    if (failed.length) setError("بعضی از APIها پاسخ ندادند؛ اعداد زیر فقط از endpointهای موفق دریافت شده‌اند. اتصال و مجوز همان endpointها را بررسی کن.");
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const productCount = data?.productsTotal ?? 0;
  const customerCount = data?.customers.length ?? 0;
  const conversationsThisMonth = (data?.conversations ?? []).filter(c => c.createdAt && new Date(c.createdAt) >= monthStart).length;
  const usageSummary = data?.usage?.summary;
  const cards = [
    { label: "محصولات کاتالوگ", value: productCount, note: "دریافت‌شده از API محصولات", icon: Boxes },
    { label: "مکالمات این ماه", value: conversationsThisMonth, note: "بر اساس تاریخ ثبت مکالمه", icon: MessageSquareText },
    { label: "مشتریان ثبت‌شده", value: customerCount, note: "حساب مشتری فعلی", icon: Users },
    { label: "ایجنت", value: data?.agent ? (data.agent.isActive === false || data.agent.status === "INACTIVE" ? "غیرفعال" : "موجود") : "—", note: "وضعیت برگشتی از API", icon: Bot },
  ];

  return <CustomerShell>
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#D6EAE5] bg-[#EFF8F5] px-3 py-1 text-[11px] font-bold text-[#10706B]"><Sparkles size={13}/> فضای هوشمند کسب‌وکار شما</div><h1 className="text-2xl font-black tracking-tight text-[#163633] sm:text-[30px]">داشبورد کسب‌وکار</h1><p className="mt-2 text-sm text-[#7C8C88]">آمار از API و داده‌های واقعی حساب شما بارگذاری می‌شود.</p></div>
      <button onClick={() => void load()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#10706B] px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{loading ? <LoaderCircle size={16} className="animate-spin"/> : <RefreshCw size={16}/>} بروزرسانی</button>
    </div>
    {error && <div role="alert" className="mb-5 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800"><AlertCircle size={18} className="mt-1 shrink-0"/>{error}</div>}
    {loading && !data ? <div className="flex items-center justify-center gap-2 rounded-2xl border bg-white p-12 text-sm text-slate-500"><LoaderCircle size={18} className="animate-spin"/> در حال دریافت اطلاعات واقعی...</div> : <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(c=>{const Icon=c.icon;return <article key={c.label} className="rounded-2xl border border-[#E4EBE8] bg-white p-5"><span className="grid h-11 w-11 place-items-center rounded-[14px] bg-[#E4F3EF] text-[#10706B]"><Icon size={21}/></span><p className="mt-5 text-3xl font-black tracking-tight text-[#183A36]">{typeof c.value === "number" ? numberFa(c.value) : c.value}</p><p className="mt-1 text-sm font-bold text-[#4D625D]">{c.label}</p><p className="mt-2 text-xs text-[#8A9794]">{c.note}</p></article>})}</section>
      <section className="mt-5 grid gap-5 xl:grid-cols-2">
        <article className="rounded-2xl border border-[#E4EBE8] bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between"><div><h2 className="font-extrabold">مصرف هوش مصنوعی</h2><p className="mt-1 text-xs text-[#87938F]">آمار ثبت‌شده برای حساب شما</p></div><Link href="/customer-usage" className="flex items-center gap-1 text-xs font-bold text-[#10706B]">جزئیات <ArrowLeft size={14}/></Link></div>
          {usageSummary ? <><div className="mt-6 flex items-end justify-between gap-3"><div><span className="text-3xl font-black text-[#173B36]">{numberFa(usageSummary.aiMessages ?? 0)}</span><span className="mr-2 text-sm text-[#87938F]">پاسخ AI ثبت‌شده</span></div><Activity className="text-[#10706B]" size={22}/></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-[#F8FAF9] p-3"><p className="text-xs text-[#87938F]">توکن ورودی</p><b className="mt-1 block text-lg">{numberFa(usageSummary.inputTokens ?? 0)}</b></div><div className="rounded-xl bg-[#F8FAF9] p-3"><p className="text-xs text-[#87938F]">توکن خروجی</p><b className="mt-1 block text-lg">{numberFa(usageSummary.outputTokens ?? 0)}</b></div><div className="rounded-xl bg-[#F8FAF9] p-3"><p className="text-xs text-[#87938F]">کل توکن</p><b className="mt-1 block text-lg">{numberFa(usageSummary.totalTokens ?? 0)}</b></div></div></> : <p className="mt-6 rounded-xl bg-[#F8FAF9] p-4 text-sm text-[#87938F]">API مصرف هنوز داده‌ای برنگردانده است؛ سهمیه یا پلن ساختگی نمایش داده نمی‌شود.</p>}
        </article>
        <article className="rounded-2xl border border-[#E4EBE8] bg-white p-5 sm:p-6"><div className="flex items-center justify-between"><div><h2 className="font-extrabold">دسترسی سریع</h2><p className="mt-1 text-xs text-[#87938F]">مدیریت داده‌های حساب</p></div></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><Link href="/product-catalog" className="rounded-xl border p-4 text-sm font-bold hover:border-[#10706B]">کاتالوگ محصولات <ArrowLeft size={15} className="inline mr-2"/></Link><Link href="/customer-support" className="rounded-xl border p-4 text-sm font-bold hover:border-[#10706B]">تیکت‌های پشتیبانی <ArrowLeft size={15} className="inline mr-2"/></Link><Link href="/customer-usage" className="rounded-xl border p-4 text-sm font-bold hover:border-[#10706B]">مصرف هوش مصنوعی <ArrowLeft size={15} className="inline mr-2"/></Link><Link href="/product-sources" className="rounded-xl border p-4 text-sm font-bold hover:border-[#10706B]">منابع محصولات <ArrowLeft size={15} className="inline mr-2"/></Link></div></article>
      </section>
    </>}
  </CustomerShell>;
}
