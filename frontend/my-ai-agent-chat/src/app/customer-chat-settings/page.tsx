"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import {
  Check,
  LoaderCircle,
  Palette,
  RotateCcw,
  Sparkles,
  Globe,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  Send,
  Droplet,
} from "lucide-react";

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

const colorFields: {
  key: keyof ThemeSettings;
  label: string;
  hint: string;
}[] = [
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

const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

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
      const result = await api<any>(
        `/sites/${encodeURIComponent(internalSiteId)}/chat-settings`
      );
      if (!result?.success || !result.settings)
        throw new Error(result?.message || "دریافت تنظیمات ناموفق بود.");
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
    return () => {
      cancelled = true;
    };
  }, [loadSettings]);

  async function saveSettings() {
    if (!siteId) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const result = await api<any>(
        `/sites/${encodeURIComponent(siteId)}/chat-settings`,
        {
          method: "PATCH",
          body: JSON.stringify(settings),
        }
      );
      if (!result?.success)
        throw new Error(result?.message || "ذخیره تنظیمات ناموفق بود.");
      setSettings({ ...defaults, ...result.settings });
      setNotice("تنظیمات رنگ با موفقیت ذخیره شد.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "ذخیره تنظیمات ناموفق بود.");
    } finally {
      setSaving(false);
    }
  }

  const isDirty = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(defaults),
    [settings]
  );

  const selectedSite = sites.find((s) => s.id === siteId);

  return (
    <div className="mx-auto max-w-7xl px-1 pb-16">
      {/* ===== Header ===== */}
      <div className="relative mb-8 overflow-hidden rounded-3xl border border-[#DCE7E4] bg-gradient-to-br from-white via-[#F4FBF9] to-[#E8F4F1] p-6 shadow-sm sm:p-8">
        <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-[#10706B]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-10 h-56 w-56 rounded-full bg-[#F59E0B]/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#10706B]/20 bg-white/70 px-3 py-1 text-xs font-bold text-[#10706B] backdrop-blur">
              <Sparkles size={14} />
              شخصی‌سازی ویجت
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              ظاهر صفحه چت
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              رنگ‌های چت را جداگانه برای هر Site ID تنظیم کن. تغییرات به‌صورت زنده در پیش‌نمایش نمایش داده می‌شوند.
            </p>
          </div>

          <button
            onClick={() => void saveSettings()}
            disabled={!siteId || saving || loading}
            className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-[#10706B] to-[#0D5C58] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#10706B]/25 transition-all hover:shadow-xl hover:shadow-[#10706B]/30 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <LoaderCircle size={17} className="animate-spin" />
            ) : (
              <Check size={17} className="transition-transform group-hover:scale-110" />
            )}
            {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
          </button>
        </div>
      </div>

      {/* ===== Alerts ===== */}
      {error && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-700 backdrop-blur"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {notice && (
        <div
          role="status"
          className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-sm text-emerald-700 backdrop-blur"
        >
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* ===== Site Selector ===== */}
      <div className="mb-6 rounded-3xl border border-[#E4EBE8] bg-white/80 p-5 shadow-sm backdrop-blur sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#10706B]/10 text-[#10706B]">
              <Globe size={18} />
            </span>
            <div>
              <label className="block text-sm font-bold text-slate-800">
                سایت موردنظر (Site ID)
              </label>
              <p className="text-xs text-slate-500">
                هر سایت تنظیمات رنگ مستقل خودش را دارد.
              </p>
            </div>
          </div>

          {selectedSite && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#10706B]/10 px-3 py-1 font-mono text-[11px] font-bold text-[#10706B]">
                {selectedSite.siteId}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600">
                {selectedSite.domain}
              </span>
            </div>
          )}
        </div>

        <select
          value={siteId}
          onChange={(event) => {
            setSiteId(event.target.value);
            void loadSettings(event.target.value);
          }}
          disabled={loading || !sites.length}
          className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-800 shadow-sm outline-none transition focus:border-[#10706B] focus:ring-4 focus:ring-[#10706B]/10 disabled:bg-slate-50"
        >
          {sites.length === 0 && <option value="">هیچ سایتی در حساب شما ثبت نشده</option>}
          {sites.map((site) => (
            <option key={site.id} value={site.id}>
              {site.name} — {site.siteId} ({site.domain})
            </option>
          ))}
        </select>
      </div>

      {/* ===== Content ===== */}
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-[#E4EBE8] bg-white/80 p-16 text-sm text-slate-500 shadow-sm backdrop-blur">
          <LoaderCircle size={28} className="animate-spin text-[#10706B]" />
          <span className="font-medium">در حال دریافت تنظیمات...</span>
        </div>
      ) : siteId ? (
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          {/* ---- Color Fields ---- */}
          <div className="grid gap-4 sm:grid-cols-2">
            {colorFields.map(({ key, label, hint }) => {
              const value = settings[key];
              const valid = HEX_RE.test(value);
              return (
                <label
                  key={key}
                  className="group relative overflow-hidden rounded-3xl border border-[#E4EBE8] bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#10706B]/30 hover:shadow-lg hover:shadow-[#10706B]/5"
                >
                  {/* color accent line */}
                  <span
                    className="absolute inset-x-0 top-0 h-1"
                    style={{
                      background: valid
                        ? `linear-gradient(90deg, ${value}, ${value}88)`
                        : "linear-gradient(90deg, #cbd5e1, #e2e8f0)",
                    }}
                  />

                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <span className="flex items-center gap-2 text-sm font-bold text-slate-800">
                        <Droplet size={14} className="text-[#10706B]" />
                        {label}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-slate-500">
                        {hint}
                      </span>
                    </div>
                    {valid && (
                      <span
                        className="h-6 w-6 shrink-0 rounded-full border-2 border-white shadow ring-1 ring-black/5"
                        style={{ backgroundColor: value }}
                        title={value}
                      />
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <input
                        type="color"
                        value={valid ? value : defaults[key]}
                        onChange={(event) =>
                          setSettings((prev) => ({
                            ...prev,
                            [key]: event.target.value,
                          }))
                        }
                        className="h-12 w-14 cursor-pointer rounded-xl border border-slate-200 bg-white p-1 shadow-sm transition group-hover:border-[#10706B]/40"
                      />
                    </div>
                    <input
                      value={value}
                      onChange={(event) =>
                        setSettings((prev) => ({
                          ...prev,
                          [key]: event.target.value,
                        }))
                      }
                      pattern="^#[0-9A-Fa-f]{6}$"
                      maxLength={7}
                      spellCheck={false}
                      className={`w-full rounded-xl border px-3 py-3 font-mono text-sm uppercase shadow-sm outline-none transition focus:ring-4 ${
                        valid
                          ? "border-slate-200 focus:border-[#10706B] focus:ring-[#10706B]/10"
                          : "border-rose-300 bg-rose-50 text-rose-600 focus:border-rose-400 focus:ring-rose-200/50"
                      }`}
                    />
                  </div>
                </label>
              );
            })}
          </div>

          {/* ---- Preview Sidebar ---- */}
          <aside className="h-fit space-y-4 xl:sticky xl:top-6">
            <div className="overflow-hidden rounded-3xl border border-[#E4EBE8] bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-[#E4EBE8] bg-gradient-to-br from-[#F8FBFA] to-white p-4">
                <span className="grid h-9 w-9 place-items-center rounded-2xl bg-[#10706B]/10 text-[#10706B]">
                  <Palette size={18} />
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-800">پیش‌نمایش زنده</p>
                  <p className="text-[11px] text-slate-500">تغییرات را همان لحظه ببین</p>
                </div>
                <span className="mr-auto flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  LIVE
                </span>
              </div>

              <div className="p-4">
                <div
                  className="overflow-hidden rounded-3xl border shadow-lg transition-all duration-300"
                  style={{
                    backgroundColor: settings.surfaceColor,
                    borderColor: settings.borderColor,
                    color: settings.textColor,
                  }}
                >
                  {/* Chat header */}
                  <div
                    className="flex items-center gap-2 border-b p-3.5"
                    style={{ borderColor: settings.borderColor }}
                  >
                    <span
                      className="grid h-9 w-9 place-items-center rounded-2xl text-sm font-bold shadow-sm"
                      style={{
                        background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.secondaryColor})`,
                        color: settings.buttonTextColor,
                      }}
                    >
                      A
                    </span>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">ایجنت هوشمند</span>
                      <span
                        className="text-[10px]"
                        style={{ color: settings.textColor, opacity: 0.6 }}
                      >
                        آنلاین
                      </span>
                    </div>
                    <span
                      className="mr-auto h-2.5 w-2.5 rounded-full shadow-sm"
                      style={{ backgroundColor: settings.accentColor }}
                    />
                  </div>

                  {/* Messages */}
                  <div
                    className="space-y-3 p-3.5"
                    style={{ backgroundColor: settings.backgroundColor }}
                  >
                    <div
                      className="mr-auto max-w-[90%] rounded-2xl rounded-tr-sm p-3 text-xs leading-5 shadow-sm transition-all"
                      style={{
                        backgroundColor: settings.userMessageColor,
                        border: `1px solid ${settings.borderColor}`,
                        color: settings.textColor,
                      }}
                    >
                      سلام، محصول موجوده؟
                    </div>
                    <div
                      className="ml-auto max-w-[90%] rounded-2xl rounded-tl-sm p-3 text-xs leading-5 shadow-sm transition-all"
                      style={{
                        backgroundColor: settings.aiMessageColor,
                        color: settings.buttonTextColor,
                      }}
                    >
                      بله، موجوده. چطور کمکتون کنم؟
                    </div>
                  </div>

                  {/* Composer */}
                  <div
                    className="border-t p-3"
                    style={{ borderColor: settings.borderColor }}
                  >
                    <div
                      className="flex items-center justify-between gap-2 rounded-2xl border p-2 pl-3 transition-all"
                      style={{
                        borderColor: settings.borderColor,
                        backgroundColor: settings.backgroundColor,
                      }}
                    >
                      <span
                        className="flex items-center gap-1.5 text-xs"
                        style={{ color: settings.textColor, opacity: 0.55 }}
                      >
                        <MessageSquare size={12} />
                        پیام خود را بنویسید...
                      </span>
                      <span
                        className="grid h-8 w-8 place-items-center rounded-xl shadow-sm transition-transform hover:scale-105"
                        style={{
                          background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.accentColor})`,
                          color: settings.buttonTextColor,
                        }}
                      >
                        <Send size={13} />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSettings(defaults)}
              disabled={!isDirty}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#E4EBE8] bg-white px-4 py-3 text-xs font-bold text-slate-600 shadow-sm transition hover:border-[#10706B]/30 hover:bg-[#F4FBF9] hover:text-[#10706B] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RotateCcw size={14} />
              بازنشانی پیش‌فرض‌ها
            </button>
          </aside>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-[#DCE7E4] bg-white/70 p-16 text-center shadow-sm backdrop-blur">
          <span className="grid h-14 w-14 place-items-center rounded-3xl bg-[#10706B]/10 text-[#10706B]">
            <Globe size={24} />
          </span>
          <p className="text-sm font-bold text-slate-700">هنوز سایتی ثبت نشده</p>
          <p className="max-w-sm text-xs leading-6 text-slate-500">
            ابتدا یک سایت در حساب خود ثبت کن تا بتوانی رنگ‌های چت را برای آن شخصی‌سازی کنی.
          </p>
        </div>
      )}
    </div>
  );
}