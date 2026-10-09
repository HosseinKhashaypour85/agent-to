"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import CustomerShell from "@/components/CustomerShell";
import { api } from "@/lib/api";
import { AlertCircle, CalendarClock, CreditCard, LoaderCircle, RefreshCw } from "lucide-react";

type Plan = { name: string; price: string | number; currency?: string; billingInterval?: string; maxCustomers?: number; maxLeads?: number; maxProducts?: number; maxAiMessages?: number };
type Subscription = { id: string; status: string; startsAt: string; expiresAt: string; plan?: Plan };
const faDate=(v?:string)=>v?new Intl.DateTimeFormat("fa-IR",{dateStyle:"medium"}).format(new Date(v)):"—";
export default function CustomerSubscriptionPage(){
 const [subscription,setSubscription]=useState<Subscription|null>(null);const [loading,setLoading]=useState(true);const [error,setError]=useState("");
 const load=useCallback(async()=>{setLoading(true);setError("");try{const r=await api<{success:boolean;subscription:Subscription|null}>("/customer-account/subscription");setSubscription(r.subscription);}catch(e){setError(e instanceof Error?e.message:"دریافت اشتراک ناموفق بود.");}finally{setLoading(false);}},[]);
 useEffect(()=>{void load();},[load]);
 return <CustomerShell><div className="mb-7 flex items-end justify-between gap-4"><div><p className="mb-2 text-xs font-bold text-[#10706B]">حساب کاربری</p><h1 className="text-2xl font-black">اشتراک و پرداخت</h1><p className="mt-2 text-sm text-[#7D8D89]">وضعیت اشتراک متعلق به حساب شما از API دریافت می‌شود.</p></div><button onClick={()=>void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-3 text-sm font-bold"><RefreshCw size={16}/>تازه‌سازی</button></div>
 {error&&<div role="alert" className="mb-4 flex gap-2 rounded-xl bg-[#FFF1F1] p-4 text-sm text-[#A62B2B]"><AlertCircle size={18}/>{error}</div>}
 {loading?<div className="flex items-center justify-center gap-2 rounded-2xl border bg-white p-12 text-sm text-[#87938F]"><LoaderCircle className="animate-spin" size={18}/>در حال دریافت...</div>:subscription?<section className="max-w-3xl rounded-2xl border border-[#E4EBE8] bg-white p-6"><div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-xl bg-[#E8F4F0] text-[#10706B]"><CreditCard size={22}/></span><div><h2 className="text-lg font-black">{subscription.plan?.name||"اشتراک فعلی"}</h2><p className="mt-1 text-xs text-[#87938F]">وضعیت: {subscription.status}</p></div></div><div className="mt-6 grid gap-3 sm:grid-cols-2">{[["شروع",faDate(subscription.startsAt)],["انقضا",faDate(subscription.expiresAt)],["قیمت",subscription.plan?new Intl.NumberFormat("fa-IR").format(Number(subscription.plan.price))+" "+(subscription.plan.currency||""):"—"],["دوره",subscription.plan?.billingInterval==="YEARLY"?"سالانه":"ماهانه"]].map(([k,v])=><div key={k} className="rounded-xl bg-[#F7FAF8] p-4"><p className="text-xs text-[#87938F]">{k}</p><b className="mt-2 block text-sm">{v}</b></div>)}</div><div className="mt-5 flex items-start gap-2 rounded-xl bg-[#FAFCFB] p-3 text-xs leading-6 text-[#7D8D89]"><CalendarClock size={16} className="mt-1 shrink-0"/>تغییر پلن یا پرداخت آنلاین تا زمان وجود API اختصاصی پرداخت در این صفحه فعال نیست.</div></section>:<section className="max-w-2xl rounded-2xl border border-[#E4EBE8] bg-white p-8 text-center"><CreditCard size={28} className="mx-auto text-[#87938F]"/><h2 className="mt-3 font-extrabold">اشتراک فعالی ثبت نشده</h2><p className="mt-2 text-sm text-[#87938F]">در حال حاضر برای این حساب اشتراکی از API برنگشت.</p><Link href="/customer-dashboard" className="mt-4 inline-block text-sm font-bold text-[#10706B]">بازگشت به داشبورد</Link></section>}</CustomerShell>;
}
