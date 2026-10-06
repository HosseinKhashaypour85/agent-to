"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, Building2, Globe2, Users, Bot, Package, MessageSquare,
  BookOpen, BriefcaseBusiness, MoreHorizontal, CheckCircle2, Clock3,
  AlertCircle, CreditCard, Activity, ExternalLink, ShieldCheck
} from "lucide-react";
import { api } from "@/lib/api";

type Overview = {
  business: {
    id: string; name: string; slug: string; email: string;
    phone?: string | null; status: string; createdAt: string;
  };
  owner: { id?: string; userId?: string; email?: string; name?: string } | null;
  team: { total: number };
  subscription: {
    id?: string; status?: string; startsAt?: string; expiresAt?: string;
    plan?: { id: string; name: string; price: string; billingInterval: string };
  } | null;
  statistics: {
    sites: number; customers: number; leads: number; conversations: number;
    products: number; knowledgeItems: number; agents: number;
  };
};

const tabs = [
  ["overview", "Overview"],
  ["subscription", "اشتراک"],
  ["team", "تیم"],
  ["sites", "Sites"],
  ["agent", "AI Agent"],
  ["activity", "Activity"],
] as const;

function Status({ value }: { value: string }) {
  const active = ["ACTIVE", "فعال"].includes(value);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
      active ? "bg-[#EAF7F1] text-[#25825A]" : "bg-[#FFF4E5] text-[#A66A17]"
    }`}>
      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-[#35A66F]" : "bg-[#D99A2B]"}`} />
      {value === "ACTIVE" ? "فعال" : value}
    </span>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="rounded-2xl border bg-white p-4" style={{ borderColor: "var(--line)" }}>
      <div className="flex items-center justify-between">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#E8F5F3] text-[#10706B]">
          <Icon size={18} />
        </div>
        <span className="text-xl font-black">{value}</span>
      </div>
      <div className="mt-3 text-xs font-bold text-[#687573]">{label}</div>
    </div>
  );
}

export default function BusinessDetails({ id }: { id: string }) {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    api<{ success: boolean; data: Overview }>(`/admin/businesses/${id}/overview`)
      .then((r) => setData(r.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const daysLeft = useMemo(() => {
    if (!data?.subscription?.expiresAt) return null;
    return Math.max(
      0,
      Math.ceil((new Date(data.subscription.expiresAt).getTime() - Date.now()) / 86400000)
    );
  }, [data]);

  if (loading) {
    return <div className="space-y-5">
      <div className="h-8 w-52 animate-pulse rounded-lg bg-[#E8ECEB]" />
      <div className="grid gap-4 md:grid-cols-4">{Array.from({length:4}).map((_,i)=><div key={i} className="h-28 animate-pulse rounded-2xl bg-white" />)}</div>
      <div className="h-96 animate-pulse rounded-2xl bg-white" />
    </div>;
  }

  if (error || !data) {
    return <div className="rounded-2xl border bg-white p-8 text-center" style={{borderColor:"var(--line)"}}>
      <AlertCircle className="mx-auto text-red-500" size={30}/>
      <h2 className="mt-3 font-black">دریافت اطلاعات Business ناموفق بود</h2>
      <p className="mt-2 text-sm text-[#687573]">{error || "اطلاعاتی پیدا نشد."}</p>
    </div>;
  }

  const b = data.business;
  const stats = data.statistics;

  return (
    <div className="space-y-5">
      <button onClick={() => history.back()} className="inline-flex items-center gap-2 text-xs font-bold text-[#687573] hover:text-[#10706B]">
        <ArrowRight size={16}/> بازگشت به کسب‌وکارها
      </button>

      <section className="rounded-3xl border bg-white p-5 lg:p-7" style={{borderColor:"var(--line)"}}>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[#071F1E] text-white">
              <Building2 size={27}/>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-black tracking-tight">{b.name}</h1>
                <Status value={b.status}/>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#71807E]">
                <span className="inline-flex items-center gap-1.5"><Globe2 size={14}/>{b.slug}</span>
                <span>{b.email}</span>
                <span>ایجاد شده {new Date(b.createdAt).toLocaleDateString("fa-IR")}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn-ghost"><MoreHorizontal size={17}/> اقدامات</button>
            <button className="btn-primary"><ExternalLink size={16}/> مشاهده سایت</button>
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Users} label="مشتریان" value={stats.customers}/>
        <Stat icon={BriefcaseBusiness} label="Leads" value={stats.leads}/>
        <Stat icon={MessageSquare} label="مکالمات" value={stats.conversations}/>
        <Stat icon={Bot} label="AI Agents" value={stats.agents}/>
      </div>

      <div className="overflow-x-auto border-b" style={{borderColor:"var(--line)"}}>
        <div className="flex min-w-max gap-1">
          {tabs.map(([key,label]) => (
            <button key={key} onClick={()=>setTab(key)}
              className={`relative px-4 py-3 text-xs font-black transition ${
                tab===key ? "text-[#10706B]" : "text-[#788482] hover:text-[#071F1E]"
              }`}>
              {label}
              {tab===key && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-[#10706B]" />}
            </button>
          ))}
        </div>
      </div>

      {tab === "overview" && (
        <div className="grid gap-5 xl:grid-cols-[1.4fr_.9fr]">
          <div className="space-y-5">
            <section className="panel p-5">
              <div className="flex items-center justify-between">
                <div><h2 className="font-black">وضعیت سرویس‌ها</h2><p className="mt-1 text-xs text-[#71807E]">نمای کلی منابع این Business</p></div>
                <ShieldCheck size={19} className="text-[#10706B]"/>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Stat icon={Globe2} label="Sites" value={stats.sites}/>
                <Stat icon={Package} label="Products" value={stats.products}/>
                <Stat icon={BookOpen} label="Knowledge Base" value={stats.knowledgeItems}/>
                <Stat icon={Bot} label="AI Agents" value={stats.agents}/>
              </div>
            </section>

            <section className="panel p-5">
              <div className="flex items-center justify-between"><h2 className="font-black">آخرین فعالیت</h2><Activity size={18} className="text-[#10706B]"/></div>
              <div className="mt-4 space-y-1">
                {[
                  ["AI Agent فعال شد","سیستم AI Agent با موفقیت فعال شد.","امروز"],
                  ["سایت متصل شد","یک Site جدید به Business اضافه شد.","دیروز"],
                  ["Knowledge به‌روزرسانی شد","اطلاعات دانش کسب‌وکار تغییر کرد.","۲ روز پیش"],
                ].map((x,i)=><div key={i} className="flex gap-3 rounded-xl p-3 hover:bg-[#F7F9F8]"><div className="mt-1.5 h-2 w-2 rounded-full bg-[#10706B]"/><div><div className="text-xs font-bold">{x[0]}</div><div className="mt-1 text-[10px] text-[#71807E]">{x[1]} · {x[2]}</div></div></div>)}
              </div>
            </section>
          </div>

          <div className="space-y-5">
            <section className="panel p-5">
              <div className="flex items-center justify-between"><h2 className="font-black">Subscription</h2><CreditCard size={18} className="text-[#10706B]"/></div>
              {data.subscription ? (
                <div className="mt-4 rounded-2xl bg-[#071F1E] p-5 text-white">
                  <div className="flex items-start justify-between"><div><div className="text-xs text-white/60">CURRENT PLAN</div><div className="mt-1 text-xl font-black">{data.subscription.plan?.name || "Plan"}</div></div><CheckCircle2 className="text-[#75D5CE]"/></div>
                  <div className="mt-6 flex justify-between text-xs"><span className="text-white/60">وضعیت</span><span>{data.subscription.status}</span></div>
                  {daysLeft !== null && <div className="mt-2 flex justify-between text-xs"><span className="text-white/60">مانده</span><span>{daysLeft} روز</span></div>}
                  <button className="mt-5 w-full rounded-xl bg-white/10 py-2.5 text-xs font-bold hover:bg-white/15">مدیریت اشتراک</button>
                </div>
              ) : <div className="mt-4 rounded-2xl border border-dashed p-6 text-center"><CreditCard className="mx-auto text-[#A3AEAC]" size={24}/><p className="mt-2 text-xs font-bold">اشتراک فعالی ندارد</p><button className="mt-4 btn-primary">اختصاص پلن</button></div>}
            </section>

            <section className="panel p-5">
              <div className="flex items-center justify-between"><h2 className="font-black">Owner</h2><Users size={18} className="text-[#10706B]"/></div>
              {data.owner ? <div className="mt-4 flex items-center gap-3 rounded-2xl bg-[#F7F9F8] p-4"><div className="grid h-11 w-11 place-items-center rounded-full bg-[#E8F5F3] font-black text-[#10706B]">O</div><div><div className="text-sm font-black">{data.owner.name || "Business Owner"}</div><div className="mt-1 text-[10px] text-[#71807E]">{data.owner.email}</div></div></div> : <div className="mt-4 rounded-2xl border border-dashed p-5 text-center"><p className="text-xs font-bold">Owner تعیین نشده</p><button className="mt-3 btn-ghost">تعیین Owner</button></div>}
            </section>
          </div>
        </div>
      )}

      {tab !== "overview" && (
        <section className="panel p-10 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#E8F5F3] text-[#10706B]"><Clock3 size={25}/></div>
          <h2 className="mt-4 text-lg font-black">{tabs.find(x=>x[0]===tab)?.[1]}</h2>
          <p className="mt-2 text-sm text-[#71807E]">ساختار این بخش آماده است و در مرحله بعد به API اختصاصی خودش متصل می‌شود.</p>
        </section>
      )}
    </div>
  );
}