"use client";

export const dynamic = "force-dynamic";

import Shell from "@/components/Shell";
import PageHeader from "@/components/PageHeader";
export default function Channels(){return <Shell><PageHeader title="کانال‌ها" description="مدیریت Website، WordPress، Telegram و WhatsApp"/><div className="grid md:grid-cols-4 gap-4">{["Website","WordPress","Telegram","WhatsApp"].map(x=><div className="card p-5" key={x}><div className="font-bold">{x}</div><div className="text-xs text-emerald-600 mt-3">● فعال</div></div>)}</div></Shell>}
