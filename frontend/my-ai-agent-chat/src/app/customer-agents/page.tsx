"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import CustomerShell from "@/components/CustomerShell";
import { api } from "@/lib/api";
import { AlertCircle, Bot, CheckCircle2, LoaderCircle, Plus, RefreshCw } from "lucide-react";

type Agent = {
  id: string;
  name: string;
  description?: string | null;
  systemPrompt?: string;
  language?: string;
  tone?: string;
  isActive?: boolean;
  createdAt?: string;
};

const DEFAULT_PROMPT =
  "شما دستیار هوشمند کسب‌وکار هستید. پاسخ‌ها را دقیق، مفید و محترمانه ارائه دهید.";

export default function CustomerAgentsPage() {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_PROMPT);
  const [language, setLanguage] = useState("fa");
  const [tone, setTone] = useState("friendly");

  const loadAgent = useCallback(async () => {
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const result = await api<{ success?: boolean; agent?: Agent }>("/agent");
      if (!result?.agent) {
        setAgent(null);
        return;
      }
      setAgent(result.agent);
      setName(result.agent.name || "");
      setDescription(result.agent.description || "");
      setSystemPrompt(result.agent.systemPrompt || DEFAULT_PROMPT);
      setLanguage(result.agent.language || "fa");
      setTone(result.agent.tone || "friendly");
    } catch (e) {
      const message = e instanceof Error ? e.message : "دریافت اطلاعات ایجنت ناموفق بود.";
      if (message.trim().toLowerCase() === "agent not found") {
        setAgent(null);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAgent();
  }, [loadAgent]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const result = await api<{ success?: boolean; message?: string; agent?: Agent }>("/agent", {
        method: agent ? "PATCH" : "POST",
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          systemPrompt: systemPrompt.trim(),
          language,
          tone,
        }),
      });
      if (!result?.agent) {
        throw new Error(result?.message || "سرور اطلاعات ایجنت را برنگرداند.");
      }
      setAgent(result.agent);
      setName(result.agent.name || "");
      setDescription(result.agent.description || "");
      setNotice(agent ? "تغییرات ایجنت ذخیره شد." : "ایجنت با موفقیت ساخته شد.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "ذخیره ایجنت ناموفق بود.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleAgent() {
    if (!agent) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const result = await api<{ agent?: Agent; message?: string }>("/agent/toggle", {
        method: "PATCH",
        body: JSON.stringify({ isActive: agent.isActive === false }),
      });
      if (result.agent) setAgent(result.agent);
      setNotice(result.message || "وضعیت ایجنت بروزرسانی شد.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "تغییر وضعیت ایجنت ناموفق بود.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <CustomerShell>
      <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-bold text-[#10706B]">فضای کسب‌وکار</p>
          <h1 className="text-2xl font-black text-[#163633]">ایجنت هوشمند</h1>
          <p className="mt-2 text-sm text-[#7D8D89]">ایجنت مختص همین حساب را بسازید و تنظیماتش را مدیریت کنید.</p>
        </div>
        <button onClick={() => void loadAgent()} disabled={loading || saving} className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-3 text-sm font-bold disabled:opacity-50">
          <RefreshCw size={16} /> تازه‌سازی
        </button>
      </div>

      {error && <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"><AlertCircle size={18} className="mt-0.5 shrink-0" /><span>{error}{error.includes("404") ? " اگر این خطا برای کل مسیر /api/v1/agent است، نسخه جدید بک‌اند را روی سرور مستقر کنید." : ""}</span></div>}
      {notice && <div role="status" className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"><CheckCircle2 size={18} />{notice}</div>}

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border bg-white p-12 text-sm text-slate-500"><LoaderCircle size={18} className="animate-spin" /> در حال بررسی ایجنت این حساب...</div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <form onSubmit={submit} className="space-y-5 rounded-2xl border border-[#E4EBE8] bg-white p-5 sm:p-7">
            <div className="flex items-center gap-3 border-b border-[#EDF1EF] pb-5">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#E4F3EF] text-[#10706B]"><Bot size={25} /></span>
              <div><h2 className="font-extrabold">{agent ? "تنظیمات ایجنت شما" : "ساخت اولین ایجنت"}</h2><p className="mt-1 text-xs text-[#87938F]">{agent ? "تغییرات مستقیماً در API ذخیره می‌شوند." : "این ایجنت به حساب فعلی شما متصل می‌شود."}</p></div>
            </div>

            <label className="block"><span className="mb-2 block text-sm font-bold">نام ایجنت *</span><input required minLength={2} maxLength={100} value={name} onChange={e => setName(e.target.value)} placeholder="مثلاً دستیار فروش من" className="w-full rounded-xl border border-[#DDE7E3] px-4 py-3 outline-none focus:border-[#10706B]" /></label>
            <label className="block"><span className="mb-2 block text-sm font-bold">توضیحات</span><textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="ایجنت چه کمکی به مشتریان شما می‌کند؟" className="w-full rounded-xl border border-[#DDE7E3] px-4 py-3 outline-none focus:border-[#10706B]" /></label>
            <label className="block"><span className="mb-2 block text-sm font-bold">دستورالعمل رفتاری ایجنت</span><textarea required value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)} rows={5} className="w-full rounded-xl border border-[#DDE7E3] px-4 py-3 leading-7 outline-none focus:border-[#10706B]" /></label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block"><span className="mb-2 block text-sm font-bold">زبان پاسخ</span><select value={language} onChange={e => setLanguage(e.target.value)} className="w-full rounded-xl border border-[#DDE7E3] bg-white px-4 py-3"><option value="fa">فارسی</option><option value="en">English</option><option value="ar">العربية</option></select></label>
              <label className="block"><span className="mb-2 block text-sm font-bold">لحن پاسخ</span><select value={tone} onChange={e => setTone(e.target.value)} className="w-full rounded-xl border border-[#DDE7E3] bg-white px-4 py-3"><option value="friendly">دوستانه</option><option value="professional">حرفه‌ای</option><option value="formal">رسمی</option><option value="casual">خودمانی</option></select></label>
            </div>
            <div className="flex flex-col gap-3 border-t border-[#EDF1EF] pt-5 sm:flex-row">
              <button type="submit" disabled={saving || !name.trim() || !systemPrompt.trim()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#10706B] px-5 py-3 font-bold text-white disabled:opacity-50">{saving ? <LoaderCircle size={17} className="animate-spin" /> : <Plus size={17} />}{agent ? "ذخیره تغییرات" : "ساخت ایجنت"}</button>
              {agent && <button type="button" onClick={() => void toggleAgent()} disabled={saving} className="rounded-xl border px-5 py-3 text-sm font-bold disabled:opacity-50">{agent.isActive === false ? "فعال‌کردن ایجنت" : "غیرفعال‌کردن ایجنت"}</button>}
            </div>
          </form>

          <aside className="h-fit rounded-2xl border border-[#E4EBE8] bg-white p-5">
            <h3 className="font-extrabold">وضعیت ایجنت</h3>
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#F7FAF8] p-4">
              <span className={`h-2.5 w-2.5 rounded-full ${agent ? agent.isActive === false ? "bg-amber-500" : "bg-emerald-500" : "bg-slate-300"}`} />
              <span className="text-sm font-bold">{agent ? agent.isActive === false ? "غیرفعال" : "فعال" : "هنوز ساخته نشده"}</span>
            </div>
            {agent && <div className="mt-4 space-y-3 text-sm"><div><p className="text-xs text-[#87938F]">شناسه ایجنت</p><p className="mt-1 break-all font-mono text-xs">{agent.id}</p></div>{agent.createdAt && <div><p className="text-xs text-[#87938F]">تاریخ ساخت</p><p className="mt-1">{new Date(agent.createdAt).toLocaleDateString("fa-IR")}</p></div>}</div>}
            <p className="mt-5 text-xs leading-6 text-[#87938F]">اطلاعات از API دریافت و در همان حساب کاربری ذخیره می‌شود؛ داده آزمایشی در این صفحه نمایش داده نمی‌شود.</p>
          </aside>
        </div>
      )}
    </CustomerShell>
  );
}
