"use client";

import { useCallback, useEffect, useState } from "react";
import CustomerShell from "@/components/CustomerShell";
import { api } from "@/lib/api";
import { AlertCircle, LoaderCircle, RefreshCw, Search } from "lucide-react";

type Row = Record<string, unknown>;
type Props = { title: string; description: string; endpoint: string; collectionKey?: string; emptyText?: string };

const labels: Record<string, string> = {
  name: "نام", firstName: "نام", lastName: "نام خانوادگی", email: "ایمیل", phone: "تلفن",
  title: "عنوان", subject: "موضوع", channel: "کانال", status: "وضعیت", source: "منبع",
  value: "ارزش", createdAt: "تاریخ ثبت", updatedAt: "آخرین تغییر", username: "نام کاربری",
  category: "دسته‌بندی", priority: "اولویت", isActive: "وضعیت", id: "شناسه",
};

function formatValue(key: string, value: unknown) {
  if (value == null || value === "") return "—";
  if (typeof value === "boolean") return value ? "فعال" : "غیرفعال";
  if (typeof value === "object") return "";
  if (/At$|Date$/.test(key)) {
    const date = new Date(String(value));
    if (!Number.isNaN(date.getTime())) return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(date);
  }
  return String(value);
}

export default function CustomerResourcePage({ title, description, endpoint, collectionKey, emptyText = "هنوز داده‌ای ثبت نشده است." }: Props) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await api<Record<string, unknown>>(endpoint);
      const candidates = collectionKey ? result[collectionKey] : result.data;
      const list = Array.isArray(candidates) ? candidates : Array.isArray(result.data) ? result.data : [];
      setRows(list.filter((item): item is Row => Boolean(item) && typeof item === "object"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "دریافت اطلاعات از API ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }, [endpoint, collectionKey]);

  useEffect(() => { void load(); }, [load]);
  const filtered = rows.filter(row => Object.values(row).some(value => String(value ?? "").toLowerCase().includes(query.toLowerCase())));
  const columns = Array.from(new Set(filtered.flatMap(row => Object.keys(row)))).filter(key => !["tenantId", "rawData", "config", "messages", "password", "systemPrompt"].includes(key)).slice(0, 5);

  return <CustomerShell>
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><p className="mb-2 text-xs font-bold text-[#10706B]">پنل کسب‌وکار / مدیریت</p><h1 className="text-2xl font-black">{title}</h1><p className="mt-2 text-sm text-[#7D8D89]">{description}</p></div>
      <button onClick={() => void load()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#DDE7E2] bg-white px-4 py-3 text-sm font-bold text-[#536660] disabled:opacity-60"><RefreshCw size={16}/>{loading ? "در حال دریافت..." : "تازه‌سازی"}</button>
    </div>
    {error && <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-[#F3D4D4] bg-[#FFF6F6] p-4 text-sm text-[#A62B2B]"><AlertCircle size={18} className="mt-0.5 shrink-0"/><div>{error}<p className="mt-1 text-xs">اطلاعات نمایشی جایگزین نشده‌اند؛ پاسخ واقعی API در دسترس نیست.</p></div></div>}
    <section className="overflow-hidden rounded-2xl border border-[#E4EBE8] bg-white">
      <div className="flex flex-col gap-3 border-b border-[#EDF1EF] p-4 sm:flex-row sm:items-center sm:justify-between"><div><b>{title}</b><p className="mt-1 text-xs text-[#87938F]">{filtered.length.toLocaleString("fa-IR")} رکورد دریافت‌شده از API</p></div><label className="flex items-center gap-2 rounded-xl border border-[#DDE7E2] px-3 py-2"><Search size={15} className="text-[#87938F]"/><input value={query} onChange={e=>setQuery(e.target.value)} className="w-full text-sm outline-none sm:w-52" placeholder="جست‌وجو در داده‌ها"/></label></div>
      {loading ? <div className="flex items-center justify-center gap-2 p-12 text-sm text-[#7D8D89]"><LoaderCircle size={18} className="animate-spin"/>در حال دریافت اطلاعات از API...</div> : filtered.length === 0 ? <div className="p-12 text-center text-sm text-[#87938F]">{error ? "داده‌ای برای نمایش دریافت نشد." : emptyText}</div> : <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-right text-sm"><thead className="bg-[#F7FAF8] text-xs text-[#7D8D89]"><tr>{columns.map(key=><th key={key} className="px-4 py-3 font-bold">{labels[key] || key}</th>)}</tr></thead><tbody>{filtered.map((row,index)=><tr key={String(row.id ?? index)} className="border-t border-[#EDF1EF]">{columns.map(key=><td key={key} className="max-w-[280px] truncate px-4 py-3 text-[#465B55]">{formatValue(key,row[key])}</td>)}</tr>)}</tbody></table></div>}
    </section>
  </CustomerShell>;
}
