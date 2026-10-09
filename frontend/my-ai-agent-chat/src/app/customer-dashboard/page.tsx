"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import CustomerShell from "@/components/CustomerShell";
import { api } from "@/lib/api";
import { Activity, AlertCircle, Bot, Boxes, CheckCircle2, CreditCard, Database, MessageSquareText, Package, Plus, RefreshCw, Sparkles, Users, Zap } from "lucide-react";

type ProductList = { success: boolean; products?: Array<{id:string;name:string}>; pagination?: {total:number} };
type ListResponse = { success: boolean; data?: unknown[] };
type ChannelResponse = { success: boolean; channels?: Array<{id:string;isActive:boolean}> };
type AgentResponse = { success: boolean; agent?: {id:string;name:string;isActive:boolean} };
type UsageResponse = { success: boolean; data?: {summary?: {aiMessages?:number;totalTokens?:number;requests?:number}} };
type Stats = { products:number; customers:number; conversations:number; leads:number; activeChannels:number; activeAgent:boolean; aiMessages:number; totalTokens:number };
const zero:Stats={products:0,customers:0,conversations:0,leads:0,activeChannels:0,activeAgent:false,aiMessages:0,totalTokens:0};
const fa=(n:number)=>new Intl.NumberFormat("fa-IR").format(n);

export default function CustomerDashboardPage() {
 const [stats,setStats]=useState<Stats>(zero);const [loading,setLoading]=useState(true);const [error,setError]=useState("");
 const load=useCallback(async()=>{
  setLoading(true);setError("");
  const requests=await Promise.allSettled([
   api<ProductList>("/agent/products?page=1&limit=1"),
   api<ListResponse>("/customers"),
   api<ListResponse>("/conversations"),
   api<ListResponse>("/leads"),
   api<ChannelResponse>("/agent/channels"),
   api<AgentResponse>("/agent"),
   api<UsageResponse>("/usage/me"),
  ]);
  const next={...zero};let failures=0;
  const value=(i:number)=>{const r=requests[i];if(r.status==="rejected"){failures++;return null;}return r.value as any;};
  const products=value(0);if(products)next.products=Number(products.pagination?.total??products.products?.length??0);
  const customers=value(1);if(customers)next.customers=Array.isArray(customers.data)?customers.data.length:0;
  const conversations=value(2);if(conversations)next.conversations=Array.isArray(conversations.data)?conversations.data.length:0;
  const leads=value(3);if(leads)next.leads=Array.isArray(leads.data)?leads.data.length:0;
  const channels=value(4);if(channels)next.activeChannels=(channels.channels||[]).filter((c:any)=>c.isActive).length;
  const agent=value(5);if(agent)next.activeAgent=Boolean(agent.agent?.isActive);
  const usage=value(6);if(usage){next.aiMessages=Number(usage.data?.summary?.aiMessages||0);next.totalTokens=Number(usage.data?.summary?.totalTokens||0);}
  setStats(next);
  if(failures===requests.length)setError("دریافت اطلاعات داشبورد از API ناموفق بود. نشست و اتصال بک‌اند را بررسی کن.");
  else if(failures>0)setError("بخشی از اطلاعات به API متصل نشد؛ اعداد موجود مربوط به پاسخ‌های موفق هستند.");
  setLoading(false);
 },[]);
 useEffect(()=>{void load();},[load]);
 const metrics=[
  {label:"محصولات کاتالوگ",value:stats.products,note:"بر اساس کاتالوگ حساب",icon:Boxes,tint:"bg-[#E4F3EF] text-[#10706B]"},
  {label:"مکالمات ثبت‌شده",value:stats.conversations,note:"کل رکوردهای دریافتی",icon:MessageSquareText,tint:"bg-[#EAF0FF] text-[#536DD8]"},
  {label:"مشتریان ثبت‌شده",value:stats.customers,note:"کل مشتریان حساب",icon:Users,tint:"bg-[#FFF2DF] text-[#B7791F]"},
  {label:"سرنخ‌های فروش",value:stats.leads,note:"کل سرنخ‌های حساب",icon:Activity,tint:"bg-[#F1EAFE] text-[#805AD5]"},
 ];
 return <CustomerShell>
  <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#D6EAE5] bg-[#EFF8F5] px-3 py-1 text-[11px] font-bold text-[#10706B]"><Sparkles size={13}/> فضای هوشمند کسب‌وکار شما</div><h1 className="text-2xl font-black tracking-tight text-[#163633] sm:text-[30px]">داشبورد کسب‌وکار</h1><p className="mt-2 text-sm text-[#7C8C88]">آمار از API حساب شما دریافت می‌شود؛ داده نمونه نمایش داده نمی‌شود.</p></div><div className="flex gap-2"><button onClick={()=>void load()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#DDE7E2] bg-white px-4 py-3 text-sm font-bold text-[#536660] disabled:opacity-60"><RefreshCw size={16}/>{loading?"در حال دریافت":"تازه‌سازی"}</button><Link href="/product-sources" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#10706B] px-4 py-3 text-sm font-bold text-white"><Plus size={17}/> اتصال منبع محصولات</Link></div></div>
  {error&&<div role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-[#F3D4D4] bg-[#FFF6F6] p-4 text-sm text-[#A62B2B]"><AlertCircle size={18} className="mt-0.5 shrink-0"/>{error}</div>}
  <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(m=>{const Icon=m.icon;return <article key={m.label} className="rounded-2xl border border-[#E4EBE8] bg-white p-5"><div className="flex items-center justify-between"><span className={`grid h-11 w-11 place-items-center rounded-[14px] ${m.tint}`}><Icon size={21}/></span>{loading&&<span className="text-xs text-[#87938F]">...</span>}</div><p className="mt-5 text-3xl font-black tracking-tight text-[#183A36]">{fa(m.value)}</p><p className="mt-1 text-sm font-bold text-[#4D625D]">{m.label}</p><p className="mt-2 text-xs text-[#8A9794]">{m.note}</p></article>})}</section>
  <section className="mt-5 grid gap-5 xl:grid-cols-2">
   <article className="rounded-2xl border border-[#E4EBE8] bg-white p-5 sm:p-6"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#E8F4F0] text-[#10706B]"><Zap size={21}/></span><div><h2 className="font-extrabold">مصرف هوش مصنوعی</h2><p className="mt-1 text-xs text-[#87938F]">مصرف ثبت‌شده در API</p></div></div><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-xl bg-[#F7FAF8] p-4"><p className="text-xs text-[#87938F]">پاسخ‌های ثبت‌شده</p><b className="mt-2 block text-2xl">{fa(stats.aiMessages)}</b></div><div className="rounded-xl bg-[#F7FAF8] p-4"><p className="text-xs text-[#87938F]">کل توکن‌ها</p><b className="mt-2 block text-2xl">{fa(stats.totalTokens)}</b></div></div><Link href="/customer-usage" className="mt-4 inline-block text-sm font-bold text-[#10706B]">مشاهده گزارش مصرف ←</Link></article>
   <article className="rounded-2xl border border-[#E4EBE8] bg-white p-5 sm:p-6"><h2 className="font-extrabold">وضعیت سرویس‌ها</h2><p className="mt-1 text-xs text-[#87938F]">بر اساس وضعیت برگشتی API</p><div className="mt-4 space-y-3">{[{label:"ایجنت هوشمند",value:stats.activeAgent?"فعال":"غیرفعال",active:stats.activeAgent,icon:Bot},{label:"کانال‌های فعال",value:fa(stats.activeChannels),active:stats.activeChannels>0,icon:Database}].map(item=>{const Icon=item.icon;return <div key={item.label} className="flex items-center gap-3 rounded-xl bg-[#F7FAF8] p-3"><Icon size={18} className="text-[#10706B]"/><span className="flex-1 text-sm font-semibold">{item.label}</span><span className={`rounded-full px-3 py-1 text-xs font-bold ${item.active?"bg-[#E7F5EF] text-[#16835D]":"bg-[#F1F3F2] text-[#84918D]"}`}>{item.value}</span></div>})}</div><div className="mt-4 flex flex-wrap gap-2"><Link href="/customer-agents" className="rounded-xl border px-3 py-2 text-xs font-bold">مدیریت ایجنت</Link><Link href="/customer-channels" className="rounded-xl border px-3 py-2 text-xs font-bold">مدیریت کانال‌ها</Link><Link href="/customer-subscription" className="rounded-xl border px-3 py-2 text-xs font-bold"><CreditCard size={14} className="ml-1 inline"/>اشتراک</Link></div></article>
  </section>
 </CustomerShell>;
}
