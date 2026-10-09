"use client";

export const dynamic = "force-dynamic";

import Shell from "@/components/Shell";
import PageHeader from "@/components/PageHeader";
export default function Payments(){return <Shell><PageHeader title="پرداخت‌ها" description="تراکنش‌ها و درآمد پلتفرم"/><div className="grid md:grid-cols-3 gap-4"><div className="card p-5"><span className="text-sm text-slate-500">درآمد این ماه</span><b className="text-2xl block mt-2">$12,480</b></div><div className="card p-5"><span className="text-sm text-slate-500">تراکنش موفق</span><b className="text-2xl block mt-2">286</b></div><div className="card p-5"><span className="text-sm text-slate-500">نرخ موفقیت</span><b className="text-2xl block mt-2">97.8%</b></div></div><div className="card mt-5 p-10 text-center text-slate-400">جدول تراکنش‌ها آماده اتصال به سرویس پرداخت است.</div></Shell>}
