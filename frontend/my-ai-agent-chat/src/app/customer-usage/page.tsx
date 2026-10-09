"use client";

import { useCallback, useEffect, useState } from "react";
import CustomerShell from "@/components/CustomerShell";
import { api } from "@/lib/api";
import { Activity, AlertCircle, LoaderCircle, RefreshCw } from "lucide-react";

type Usage = { period?: { from: string; to: string }; summary?: { aiMessages?: number; inputTokens?: number; outputTokens?: number; totalTokens?: number; requests?: number }; daily?: Array<{ date: string; aiMessages: number; totalTokens: number }>; recent?: Array<{ id: string; source: string; model: string; totalTokens: number; createdAt: string }> };

const n = (v?: number) => new Intl.NumberFormat("fa-IR").format(v || 0);
export default function CustomerUsagePage() {
  const [usage,setUsage] = useState<Usage | null>(null);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState("");
  const load = useCallback(async()=>{setLoading(true);setError("");try{const r=await api<{success:boolean;data:Usage}>("/usage/me");setUsage(r.data);}catch(e){setError(e instanceof Error?e.message:"دریافت گزارش مصرف ناموفق بود.");}finally{setLoading(false);}},[]);
  useEffect(()=>{void load();},[load]);
  const s=usage?.summary;
  return <CustomerShell><div className="mb-7 flex items-end justify-between gap-4"><div><p className="mb-2 text-xs font-bold text-[#10706B]">حساب کاربری</p><h1 className="text-2xl font-black">مصرف هوش مصنوعی</h1><p className="mt-2 text-sm text-[#7D8D89]">آمار واقعی مصرف ثبت‌شده برای حساب شما.</p></div><button onClick={()=>void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-3 text-sm font-bold"><RefreshCw size={16}/>تازه‌سازی</button></div>
  {error&&<div role="alert" className="mb-4 flex gap-2 rounded-xl bg-[#FFF1F1] p-4 text-sm text-[#A62B2B]"><AlertCircle size={18}/>{error}</div>}
  {loading?<div className="flex items-center justify-center gap-2 rounded-2xl border bg-white p-12 text-sm text-[#87938F]"><LoaderCircle className="animate-spin" size={18}/>در حال دریافت گزارش از API...</div>:<><section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[{label:"پاسخ‌های هوش مصنوعی",value:s?.aiMessages},{label:"کل توکن‌ها",value:s?.totalTokens},{label:"توکن ورودی",value:s?.inputTokens},{label:"توکن خروجی",value:s?.outputTokens}].map(x=><article key={x.label} className="rounded-2xl border border-[#E4EBE8] bg-white p-5"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#E8F4F0] text-[#10706B]"><Activity size={19}/></span><p className="mt-4 text-xs text-[#87938F]">{x.label}</p><b className="mt-1 block text-2xl">{n(x.value)}</b></article>)}</section>
  <section className="mt-5 overflow-hidden rounded-2xl border border-[#E4EBE8] bg-white"><div className="border-b p-5"><h2 className="font-extrabold">مصرف روزانه</h2><p className="mt-1 text-xs text-[#87938F]">درخواست‌ها: {n(s?.requests)}</p></div>{(usage?.daily||[]).length===0?<p className="p-8 text-center text-sm text-[#87938F]">در این بازه مصرفی ثبت نشده است.</p>:<div className="divide-y">{usage?.daily?.map(d=><div key={d.date} className="flex items-center justify-between gap-4 px-5 py-4 text-sm"><span>{new Intl.DateTimeFormat("fa-IR",{dateStyle:"medium"}).format(new Date(d.date))}</span><span className="text-[#7D8D89]">{n(d.aiMessages)} پاسخ · {n(d.totalTokens)} توکن</span></div>)}</div>}</section>
  </>}</CustomerShell>;
}
