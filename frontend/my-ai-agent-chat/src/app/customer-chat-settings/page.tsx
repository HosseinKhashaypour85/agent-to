"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Check, LoaderCircle, Palette, RotateCcw } from "lucide-react";

type Site = { id: string; siteId: string; name: string; domain: string };
type ThemeSettings = {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  userMessageColor: string;
  aiMessageColor: string;
  textColor: string;
  borderColor: string;
  buttonTextColor: string;
};

const colorFields: { key: keyof ThemeSettings; label: string; hint: string }[] = [
  { key: "primaryColor", label: "Primary", hint: "رنگ اصلی برند، دکمه‌ها و آیکون‌ها" },
  { key: "secondaryColor", label: "Secondary", hint: "رنگ دوم برای گرادیان‌ها و عناصر مکمل" },
  { key: "accentColor", label: "Accent", hint: "رنگ تأکیدی برای جزئیات و برجسته‌سازی" },
  { key: "backgroundColor", label: "پس‌زمینه صفحه", hint: "پس‌زمینه بیرون پنجره چت" },
  { key: "surfaceColor", label: "سطح پنجره چت", hint: "پس‌زمینه پنجره و کارت‌ها" },
  { key: "userMessageColor", label: "پیام کاربر", hint: "پس‌زمینه حباب پیام کاربر" },
  { key: "aiMessageColor", label: "پیام ایجنت", hint: "پس‌زمینه حباب پاسخ هوش مصنوعی" },
  { key: "textColor", label: "متن", hint: "رنگ متن اصلی" },
  { key: "borderColor", label: "حاشیه‌ها", hint: "رنگ خط‌ها و مرز عناصر" },
  { key: "buttonTextColor", label: "متن روی رنگ اصلی", hint: "رنگ متن داخل دکمه‌ها و پاسخ ایجنت" },
];

const defaults: ThemeSettings = {
  primaryColor: "#10706B",
  secondaryColor: "#0D5C58",
  accentColor: "#F59E0B",
  backgroundColor: "#F8F9FC",
  surfaceColor: "#FFFFFF",
  userMessageColor: "#F1F3F5",
  aiMessageColor: "#10706B",
  textColor: "#171717",
  borderColor: "#E5E7EB",
  buttonTextColor: "#FFFFFF",
};

export default function CustomerChatSettingsPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [siteId, setSiteId] = useState("");
  const [settings, setSettings] = useState<ThemeSettings>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadSettings = useCallback(async (internalSiteId: string) => {
    if (!internalSiteId) return;
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const result = await api<any>(`/sites/${encodeURIComponent(internalSiteId)}/chat-settings`);
      if (!result?.success || !result.settings) throw new Error(result?.message || "دریافت تنظیمات ناموفق بود.");
      setSettings({ ...defaults, ...result.settings });
    } catch (err) {
      setError(err instanceof Error ? err.message : "دریافت تنظیمات ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      setLoading(true);
      try {
        const result = await api<any>("/sites");
        const list: Site[] = Array.isArray(result?.data) ? result.data : [];
        if (cancelled) return;
        setSites(list);
        const initial = list[0]?.id || "";
        setSiteId(initial);
        if (initial) await loadSettings(initial);
        else setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "دریافت سایت‌ها ناموفق بود.");
          setLoading(false);
        }
      }
    }
    void init();
    return () => { cancelled = true; };
  }, [loadSettings]);

  async function saveSettings() {
    if (!siteId) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const result = await api<any>(`/sites/${encodeURIComponent(siteId)}/chat-settings`, {
        method: "PATCH",
        body: JSON.stringify(settings),
      });
      if (!result?.success) throw new Error(result?.message || "ذخیره تنظیمات ناموفق بود.");
      setSettings({ ...defaults, ...result.settings });
      setNotice("تنظیمات رنگ با موفقیت ذخیره شد.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "ذخیره تنظیمات ناموفق بود.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold text-[#10706B]">شخصی‌سازی ویجت</p>
          <h1 className="text-2xl font-black">ظاهر صفحه چت</h1>
          <p className="mt-2 text-sm text-[#7D8D89]">رنگ‌های چت را جداگانه برای هر Site ID تنظیم کن.</p>
        </div>
        <button onClick={() => void saveSettings()} disabled={!siteId || saving || loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#10706B] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">
          {saving ? <LoaderCircle size={17} className="animate-spin" /> : <Check size={17} />}
          ذخیره تغییرات
        </button>
      </div>

      {error && <div role="alert" className="mb-4 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}
      {notice && <div role="status" className="mb-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">{notice}</div>}

      <div className="mb-6 rounded-2xl border border-[#E4EBE8] bg-white p-5">
        <label className="mb-2 block text-sm font-bold">سایت موردنظر (Site ID)</label>
        <select value={siteId} onChange={(event) => { setSiteId(event.target.value); void loadSettings(event.target.value); }} disabled={loading || !sites.length} className="w-full max-w-xl rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#10706B]">
          {sites.length === 0 && <option value="">هیچ سایتی در حساب شما ثبت نشده</option>}
          {sites.map((site) => <option key={site.id} value={site.id}>{site.name} — {site.siteId} ({site.domain})</option>)}
        </select>
        <p className="mt-2 text-xs text-slate-500">هر سایت تنظیمات رنگ مستقل خودش را دارد.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border bg-white p-12 text-sm text-slate-500"><LoaderCircle size={18} className="animate-spin" /> در حال دریافت تنظیمات...</div>
      ) : siteId ? (
        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <div className="grid gap-4 sm:grid-cols-2">
            {colorFields.map(({ key, label, hint }) => (
              <label key={key} className="rounded-2xl border border-[#E4EBE8] bg-white p-4">
                <span className="mb-1 block text-sm font-bold">{label}</span>
                <span className="mb-3 block text-xs leading-5 text-slate-500">{hint}</span>
                <span className="flex items-center gap-3">
                  <input type="color" value={/^#[0-9A-Fa-f]{6}$/.test(settings[key]) ? settings[key] : defaults[key]} onChange={(event) => setSettings((prev) => ({ ...prev, [key]: event.target.value }))} className="h-11 w-14 cursor-pointer rounded-lg border border-slate-200 bg-white p-1" />
                  <input value={settings[key]} onChange={(event) => setSettings((prev) => ({ ...prev, [key]: event.target.value }))} pattern="^#[0-9A-Fa-f]{6}$" maxLength={7} className="w-32 rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm uppercase" />
                </span>
              </label>
            ))}
          </div>

          <aside className="h-fit rounded-2xl border border-[#E4EBE8] bg-white p-4">
            <div className="mb-4 flex items-center gap-2 font-bold"><Palette size={18} className="text-[#10706B]" /> پیش‌نمایش</div>
            <div className="overflow-hidden rounded-2xl border" style={{ backgroundColor: settings.surfaceColor, borderColor: settings.borderColor, color: settings.textColor }}>
              <div className="flex items-center gap-2 border-b p-3" style={{ borderColor: settings.borderColor }}>
                <span className="grid h-8 w-8 place-items-center rounded-xl text-white" style={{ background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.secondaryColor})` }}>A</span>
                <span className="text-sm font-bold">ایجنت هوشمند</span>
                <span className="mr-auto h-2 w-2 rounded-full" style={{ backgroundColor: settings.accentColor }} />
              </div>
              <div className="space-y-3 p-3" style={{ backgroundColor: settings.backgroundColor }}>
                <div className="mr-auto max-w-[90%] rounded-2xl p-3 text-xs leading-5" style={{ backgroundColor: settings.userMessageColor, border: `1px solid ${settings.borderColor}` }}>سلام، محصول موجوده؟</div>
                <div className="ml-auto max-w-[90%] rounded-2xl p-3 text-xs leading-5" style={{ backgroundColor: settings.aiMessageColor, color: settings.buttonTextColor }}>بله، موجوده. چطور کمکتون کنم؟</div>
              </div>
              <div className="border-t p-3" style={{ borderColor: settings.borderColor }}>
                <div className="flex items-center justify-between rounded-xl border p-2" style={{ borderColor: settings.borderColor, backgroundColor: settings.backgroundColor }}>
                  <span className="text-xs" style={{ color: settings.textColor }}>پیام خود را بنویسید...</span>
                  <span className="grid h-8 w-8 place-items-center rounded-lg text-white" style={{ background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.accentColor})` }}>➤</span>
                </div>
              </div>
            </div>
            <button type="button" onClick={() => setSettings(defaults)} className="mt-4 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"><RotateCcw size={14} /> بازنشانی پیش‌فرض‌ها</button>
          </aside>
        </div>
      ) : (
        <div className="rounded-2xl border bg-white p-10 text-center text-sm text-slate-500">ابتدا یک سایت در حساب خود ثبت کن.</div>
      )}
    </div>
  );
}
