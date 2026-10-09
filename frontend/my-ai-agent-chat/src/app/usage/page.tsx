"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Shell from "@/components/Shell";
import PageHeader from "@/components/PageHeader";
import { api } from "@/lib/api";
import {
  Activity,
  Bot,
  CalendarDays,
  Coins,
  Download,
  Loader2,
  MessageSquareText,
  RefreshCw,
  Search,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

type Period = { from: string; to: string };
type UsageSummary = {
  aiMessages: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  recordsWithTokenUsage: number;
  requests: number;
};
type DailyUsage = {
  date: string;
  aiMessages: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
};
type TenantUsage = {
  tenantId: string;
  aiMessages: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  requests: number;
};
type UsageRecord = {
  id: string;
  tenantId: string;
  conversationId: string;
  source: "LLM" | "KNOWLEDGE_BASE" | string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  aiMessages: number;
  usageAvailable: boolean;
  createdAt: string;
};
type UsageReport = {
  period: Period;
  summary: UsageSummary;
  tenants: TenantUsage[];
  daily: DailyUsage[];
  recent: UsageRecord[];
};
type ApiResponse = { success: boolean; data: UsageReport; message?: string };

type RangeKey = "today" | "7d" | "30d" | "custom";

const numberFa = (value: number) =>
  new Intl.NumberFormat("fa-IR").format(Number.isFinite(value) ? value : 0);

function formatDate(value?: string, includeTime = false) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
    ...(includeTime ? { timeStyle: "short" as const } : {}),
  }).format(date);
}

function dateInputValue(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function getRange(range: RangeKey, customFrom: string, customTo: string) {
  const today = new Date();
  const to = dateInputValue(today);
  if (range === "custom") {
    return { from: customFrom || to, to: customTo || to };
  }
  const fromDate = new Date(today);
  if (range === "today") {
    return { from: to, to };
  }
  fromDate.setDate(fromDate.getDate() - (range === "7d" ? 6 : 29));
  return { from: dateInputValue(fromDate), to };
}

function ErrorPanel({ message, retry }: { message: string; retry: () => void }) {
  return (
    <div className="card p-8 text-center">
      <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-rose-50 text-rose-600">
        <AlertCircle size={24} />
      </div>
      <h3 className="font-bold text-slate-800">بارگذاری اطلاعات مصرف ناموفق بود</h3>
      <p className="mt-2 text-sm text-slate-500">{message}</p>
      <button onClick={retry} className="btn-primary mt-5 inline-flex items-center gap-2">
        <RefreshCw size={16} /> تلاش مجدد
      </button>
    </div>
  );
}

export default function UsagePage() {
  const [report, setReport] = useState<UsageReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [range, setRange] = useState<RangeKey>("30d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [tenantSearch, setTenantSearch] = useState("");

  const queryRange = useMemo(
    () => getRange(range, customFrom, customTo),
    [range, customFrom, customTo]
  );

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams({ from: queryRange.from, to: queryRange.to });
      const response = await api<ApiResponse>(`/admin/usage?${query.toString()}`);
      if (!response?.success || !response.data) {
        throw new Error(response?.message || "پاسخ گزارش مصرف معتبر نیست.");
      }
      setReport(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطای نامشخص در دریافت گزارش.");
    } finally {
      setLoading(false);
    }
  }, [queryRange.from, queryRange.to]);

  useEffect(() => {
    void loadReport();
  }, [loadReport]);

  const filteredTenants = useMemo(() => {
    const tenants = report?.tenants ?? [];
    const term = tenantSearch.trim().toLowerCase();
    if (!term) return tenants;
    return tenants.filter((item) => item.tenantId.toLowerCase().includes(term));
  }, [report?.tenants, tenantSearch]);

  function exportCsv() {
    if (!report) return;
    const rows = [
      ["Tenant ID", "AI messages", "Requests", "Input tokens", "Output tokens", "Total tokens"],
      ...report.tenants.map((item) => [
        item.tenantId,
        item.aiMessages,
        item.requests,
        item.inputTokens,
        item.outputTokens,
        item.totalTokens,
      ]),
    ];
    const csv = "\uFEFF" + rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `agent-to-usage-${queryRange.from}-${queryRange.to}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const summary = report?.summary;
  const daily = report?.daily ?? [];
  const maxDailyTokens = Math.max(1, ...daily.map((item) => item.totalTokens));

  return (
    <Shell>
      <PageHeader
        eyebrow="ANALYTICS"
        title="مصرف و Usage"
        description="پایش مصرف هوش مصنوعی، پیام‌ها و توکن‌های کسب‌وکارهای پلتفرم AGENT-TO"
      />

      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="ml-1 inline-flex items-center gap-2 text-sm font-bold text-slate-600">
            <CalendarDays size={17} /> بازه گزارش
          </span>
          {([
            ["today", "امروز"],
            ["7d", "۷ روز اخیر"],
            ["30d", "۳۰ روز اخیر"],
            ["custom", "بازه دلخواه"],
          ] as [RangeKey, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setRange(key)}
              className={`rounded-xl px-3.5 py-2 text-sm font-bold transition ${range === key ? "bg-brand-600 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {range === "custom" && (
            <>
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-500">
                از
                <input aria-label="از تاریخ" type="date" value={customFrom} max={customTo || undefined} onChange={(e) => setCustomFrom(e.target.value)} className="min-w-0 bg-transparent text-sm text-slate-700 outline-none" />
              </label>
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-500">
                تا
                <input aria-label="تا تاریخ" type="date" value={customTo} min={customFrom || undefined} onChange={(e) => setCustomTo(e.target.value)} className="min-w-0 bg-transparent text-sm text-slate-700 outline-none" />
              </label>
            </>
          )}
          <button onClick={() => void loadReport()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            بروزرسانی
          </button>
          <button onClick={exportCsv} disabled={!report || loading} className="inline-flex items-center gap-2 rounded-xl bg-[#10706B] px-3.5 py-2 text-sm font-bold text-white hover:bg-[#0B5C57] disabled:opacity-50">
            <Download size={16} /> خروجی CSV
          </button>
        </div>
      </div>

      {loading && !report ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => <div key={item} className="card h-32 animate-pulse bg-slate-50" />)}
          <div className="card h-72 animate-pulse bg-slate-50 sm:col-span-2 xl:col-span-4" />
        </div>
      ) : error && !report ? (
        <ErrorPanel message={error} retry={() => void loadReport()} />
      ) : report && summary ? (
        <>
          {error && <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">آخرین بروزرسانی ناموفق بود: {error}</div>}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile title="پاسخ‌های هوش مصنوعی" value={summary.aiMessages} caption="تعداد پاسخ‌های ثبت‌شده" icon={MessageSquareText} tone="teal" />
            <StatTile title="مجموع توکن‌ها" value={summary.totalTokens} caption="ورودی + خروجی" icon={Coins} tone="violet" />
            <StatTile title="توکن ورودی" value={summary.inputTokens} caption="Prompt / Input tokens" icon={Activity} tone="blue" />
            <StatTile title="توکن خروجی" value={summary.outputTokens} caption="Completion / Output tokens" icon={Sparkles} tone="amber" />
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-[1.55fr_1fr]">
            <section className="card min-w-0 p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-black text-slate-800">روند مصرف توکن</h2>
                  <p className="mt-1 text-xs text-slate-500">مجموع توکن مصرف‌شده در هر روز</p>
                </div>
                <div className="rounded-xl bg-teal-50 px-3 py-2 text-xs font-bold text-[#10706B]">{formatDate(queryRange.from)} تا {formatDate(queryRange.to)}</div>
              </div>
              {daily.length ? (
                <div className="mt-7">
                  <div className="flex h-56 items-end gap-1.5 sm:gap-2">
                    {daily.map((item) => {
                      const height = Math.max(item.totalTokens > 0 ? 5 : 1, (item.totalTokens / maxDailyTokens) * 100);
                      return (
                        <div key={item.date} className="group relative flex h-full min-w-0 flex-1 flex-col justify-end">
                          <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-2 text-[11px] text-white shadow-lg group-hover:block">
                            <div className="font-bold">{formatDate(item.date)}</div>
                            <div className="mt-1">توکن: {numberFa(item.totalTokens)}</div>
                            <div>پیام: {numberFa(item.aiMessages)}</div>
                          </div>
                          <div className="w-full rounded-t-md bg-[#10706B] transition-all hover:bg-[#248F87]" style={{ height: `${height}%`, minHeight: item.totalTokens > 0 ? 5 : 2 }} />
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2 text-[10px] text-slate-400">
                    <span>{formatDate(daily[0]?.date)}</span>
                    {daily.length > 2 && <span>{numberFa(daily.length)} روز</span>}
                    <span>{formatDate(daily[daily.length - 1]?.date)}</span>
                  </div>
                </div>
              ) : (
                <EmptyState text="در این بازه داده‌ای برای نمودار ثبت نشده است." />
              )}
            </section>

            <section className="card p-5 sm:p-6">
              <h2 className="text-base font-black text-slate-800">وضعیت داده‌ها</h2>
              <p className="mt-1 text-xs text-slate-500">شفافیت آمار توکن ثبت‌شده از ارائه‌دهنده</p>
              <div className="mt-5 space-y-4">
                <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-4">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-emerald-600"><CheckCircle2 size={20} /></div>
                  <div className="min-w-0 flex-1"><p className="text-sm font-bold text-slate-800">رکوردهای دارای آمار توکن</p><p className="mt-1 text-xs text-slate-500">آمار برگشتی از مدل</p></div>
                  <b className="text-lg text-emerald-700">{numberFa(summary.recordsWithTokenUsage)}</b>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#10706B]"><Bot size={20} /></div>
                  <div className="min-w-0 flex-1"><p className="text-sm font-bold text-slate-800">تعداد درخواست‌ها</p><p className="mt-1 text-xs text-slate-500">رکوردهای ثبت‌شده در گزارش</p></div>
                  <b className="text-lg text-slate-800">{numberFa(summary.requests)}</b>
                </div>
                <div className="rounded-xl border border-slate-100 p-4">
                  <div className="flex justify-between text-sm"><span className="text-slate-500">میانگین توکن برای هر پاسخ</span><b className="text-slate-800">{numberFa(summary.aiMessages ? Math.round(summary.totalTokens / summary.aiMessages) : 0)}</b></div>
                  <div className="mt-3 flex justify-between text-sm"><span className="text-slate-500">تعداد Tenantهای دارای مصرف</span><b className="text-slate-800">{numberFa(report.tenants.length)}</b></div>
                </div>
              </div>
              <p className="mt-4 text-[11px] leading-6 text-slate-400">اگر سرویس مدل مقدار توکن را برنگرداند، آن رکورد در مصرف توکن صفر ثبت می‌شود و به‌عنوان آمار تأییدشده شمرده نمی‌شود.</p>
            </section>
          </div>

          <section className="card mt-5 overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div><h2 className="text-base font-black text-slate-800">مصرف بر اساس کسب‌وکار</h2><p className="mt-1 text-xs text-slate-500">مقایسه مصرف Tenantها در بازه انتخاب‌شده</p></div>
              <label className="flex w-full items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 sm:max-w-xs">
                <Search size={16} className="text-slate-400" />
                <input value={tenantSearch} onChange={(e) => setTenantSearch(e.target.value)} placeholder="جست‌وجو با شناسه Tenant" className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" />
              </label>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-right text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="px-5 py-3 font-bold">Tenant ID</th><th className="px-5 py-3 font-bold">پاسخ AI</th><th className="px-5 py-3 font-bold">درخواست‌ها</th><th className="px-5 py-3 font-bold">توکن ورودی</th><th className="px-5 py-3 font-bold">توکن خروجی</th><th className="px-5 py-3 font-bold">مجموع توکن</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTenants.map((tenant) => <tr key={tenant.tenantId} className="hover:bg-slate-50/80"><td className="px-5 py-4"><span className="font-mono text-xs text-slate-600">{tenant.tenantId}</span></td><td className="px-5 py-4 font-bold text-slate-700">{numberFa(tenant.aiMessages)}</td><td className="px-5 py-4 text-slate-600">{numberFa(tenant.requests)}</td><td className="px-5 py-4 text-slate-600">{numberFa(tenant.inputTokens)}</td><td className="px-5 py-4 text-slate-600">{numberFa(tenant.outputTokens)}</td><td className="px-5 py-4 font-black text-[#10706B]">{numberFa(tenant.totalTokens)}</td></tr>)}
                  {!filteredTenants.length && <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-400">موردی برای نمایش وجود ندارد.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card mt-5 overflow-hidden">
            <div className="border-b border-slate-100 p-5"><h2 className="text-base font-black text-slate-800">آخرین رکوردهای مصرف</h2><p className="mt-1 text-xs text-slate-500">حداکثر ۵۰ رکورد اخیر در بازه انتخاب‌شده</p></div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-right text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="px-5 py-3 font-bold">زمان</th><th className="px-5 py-3 font-bold">Tenant</th><th className="px-5 py-3 font-bold">منبع</th><th className="px-5 py-3 font-bold">مدل</th><th className="px-5 py-3 font-bold">ورودی</th><th className="px-5 py-3 font-bold">خروجی</th><th className="px-5 py-3 font-bold">مجموع</th><th className="px-5 py-3 font-bold">وضعیت Usage</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {(report.recent ?? []).map((item) => <tr key={item.id} className="hover:bg-slate-50/80"><td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">{formatDate(item.createdAt, true)}</td><td className="px-5 py-4 font-mono text-[11px] text-slate-600">{item.tenantId}</td><td className="px-5 py-4"><span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${item.source === "LLM" ? "bg-violet-50 text-violet-700" : "bg-sky-50 text-sky-700"}`}>{item.source === "LLM" ? "مدل AI" : item.source === "KNOWLEDGE_BASE" ? "پایگاه دانش" : item.source}</span></td><td className="px-5 py-4 text-xs text-slate-600">{item.model || "—"}</td><td className="px-5 py-4 text-slate-600">{numberFa(item.inputTokens)}</td><td className="px-5 py-4 text-slate-600">{numberFa(item.outputTokens)}</td><td className="px-5 py-4 font-bold text-[#10706B]">{numberFa(item.totalTokens)}</td><td className="px-5 py-4"><span className={`inline-flex items-center gap-1.5 text-xs font-bold ${item.usageAvailable ? "text-emerald-700" : "text-amber-700"}`}><span className={`h-1.5 w-1.5 rounded-full ${item.usageAvailable ? "bg-emerald-500" : "bg-amber-500"}`} />{item.usageAvailable ? "تأییدشده" : "توکن گزارش نشده"}</span></td></tr>)}
                  {!(report.recent ?? []).length && <tr><td colSpan={8} className="px-5 py-10 text-center text-sm text-slate-400">هنوز رکورد مصرفی ثبت نشده است.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}
    </Shell>
  );
}

function StatTile({
  title,
  value,
  caption,
  icon: Icon,
  tone,
}: {
  title: string;
  value: number;
  caption: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  tone: "teal" | "violet" | "blue" | "amber";
}) {
  const tones = {
    teal: "bg-teal-50 text-[#10706B]",
    violet: "bg-violet-50 text-violet-700",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
  };
  return (
    <div className="card p-5 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className={`grid h-11 w-11 place-items-center rounded-xl ${tones[tone]}`}><Icon size={21} /></div>
        <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-400">در بازه</span>
      </div>
      <div className="mt-5 text-2xl font-black tracking-tight text-slate-900">{numberFa(value)}</div>
      <div className="mt-1 text-sm font-bold text-slate-700">{title}</div>
      <div className="mt-1 text-xs text-slate-400">{caption}</div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="grid min-h-48 place-items-center text-center text-sm text-slate-400"><div><Activity size={28} className="mx-auto mb-3 opacity-40" />{text}</div></div>;
}
