"use client";

import Link from "next/link";
import { ArrowRight, Bot } from "lucide-react";

export default function LiveDemoPage() {
  return <main dir="rtl" className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,rgba(16,112,107,.12),transparent_35%),#f8fbfa] px-3 py-5 sm:px-6 sm:py-8">
    <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 pb-5">
      <Link href="/" className="flex items-center gap-2.5"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#10706B] text-white"><Bot size={22}/></span><span className="text-lg font-black text-slate-950">Agent<span className="text-[#10706B]">-To</span></span></Link>
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#10706B]"><ArrowRight size={16}/> بازگشت به سایت</Link>
    </header>
    <section className="mx-auto max-w-6xl"><div className="mb-5 text-center"><p className="text-sm font-bold text-[#10706B]">تجربه واقعی محصول</p><h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">با دستیار Agent-To گفتگو کن</h1><p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600">این دمو به ویجت واقعی چت متصل است و با شناسه سایت <bdi dir="ltr">AGENT-TO</bdi> اجرا می‌شود.</p></div>
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-2 shadow-[0_30px_90px_-35px_rgba(15,63,60,.3)] sm:p-3"><iframe title="دموی زنده Agent-To" src="/widget?siteId=AGENT-TO" className="h-[min(78vh,820px)] min-h-[620px] w-full rounded-2xl border border-slate-100 bg-slate-50" allow="clipboard-write" /></div>
    <p className="mt-4 text-center text-xs leading-6 text-slate-500">اگر تنظیمات یا پاسخ‌گویی نمایش داده نشد، بررسی کن شناسه <bdi dir="ltr">AGENT-TO</bdi> در بک‌اند ثبت و فعال باشد.</p></section>
  </main>;
}
