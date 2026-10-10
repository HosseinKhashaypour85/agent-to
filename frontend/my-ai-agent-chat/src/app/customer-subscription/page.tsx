"use client";

import { useCallback, useEffect, useState } from "react";
import CustomerShell from "@/components/CustomerShell";
import { api } from "@/lib/api";
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  CreditCard,
  Globe2,
  LoaderCircle,
  RefreshCw,
  CalendarDays,
  ShieldCheck,
} from "lucide-react";

type Site = {
  id: string;
  siteId: string;
  name: string;
  domain: string;
  status: "INSTALLING" | "ACTIVE" | "INACTIVE";
};

type Plan = {
  id: string;
  name: string;
  description?: string | null;
  price: number | string;
  currency?: string;
  billingInterval?: "MONTHLY" | "YEARLY";
  maxAgents?: number;
  maxAiMessages?: number;
};

type Subscription = {
  id: string;
  siteId?: string | null;
  status: "ACTIVE" | "EXPIRED" | "SUSPENDED" | "CANCELLED";
  effectiveStatus?: "ACTIVE" | "EXPIRED" | "SUSPENDED" | "CANCELLED" | "SCHEDULED";
  startsAt: string;
  expiresAt: string;
  createdAt?: string;
  plan?: Plan | null;
  site?: Site | null;
};

const statusLabels: Record<string, string> = {
  ACTIVE: "فعال",
  EXPIRED: "منقضی شده",
  SUSPENDED: "تعلیق شده",
  CANCELLED: "لغو شده",
  SCHEDULED: "شروع در آینده",
};

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fa-IR", { year: "numeric", month: "long", day: "numeric" }).format(date);
}

function formatPrice(value?: number | string, currency = "USD") {
  if (value === undefined || value === null || value === "") return "—";
  const amount = Number(value);
  if (!Number.isFinite(amount)) return String(value);
  return `${new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 2 }).format(amount)} ${currency}`;
}

function statusClasses(status: string) {
  if (status === "ACTIVE") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "SCHEDULED") return "bg-sky-50 text-sky-700 ring-sky-200";
  if (status === "EXPIRED" || status === "CANCELLED") return "bg-rose-50 text-rose-700 ring-rose-200";
  return "bg-amber-50 text-amber-700 ring-amber-200";
}

export default function CustomerSubscriptionPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadSubscriptions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await api<{ success?: boolean; data?: Subscription[] }>("/subscriptions/me");
      setSubscriptions(result.data || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "دریافت اطلاعات اشتراک ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSubscriptions();
  }, [loadSubscriptions]);

  async function copyValue(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setNotice(`${label} کپی شد.`);
      window.setTimeout(() => setNotice(""), 2500);
    } catch {
      setError("کپی انجام نشد؛ مقدار را به‌صورت دستی انتخاب کنید.");
    }
  }

  const activeCount = subscriptions.filter((item) => (item.effectiveStatus || item.status) === "ACTIVE").length;

  return (
    <CustomerShell>
      <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-bold text-[#10706B]">حساب کاربری</p>
          <h1 className="text-2xl font-black text-[#163633]">اشتراک من</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7D8D89]">
            وضعیت اشتراک فعال، پلن، تاریخ اعتبار و شناسه سایت اختصاص‌یافته توسط سوپرادمین را اینجا ببینید.
          </p>
        </div>
        <button type="button" onClick={() => void loadSubscriptions()} disabled={loading} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#DDEFEA] bg-[#E8F5F3] px-4 text-sm font-bold text-[#10706B] hover:bg-[#DDEFEA] disabled:opacity-50">
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          تازه‌سازی
        </button>
      </div>

      {notice && <div role="status" className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"><CheckCircle2 size={18} /> {notice}</div>}
      {error && <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"><AlertCircle size={18} className="mt-0.5 shrink-0" /><span>{error}</span></div>}

      {!loading && subscriptions.length > 0 && (
        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#E4EBE8] bg-white p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F5F3] text-[#10706B]"><ShieldCheck size={20} /></div>
            <p className="text-sm text-[#7D8D89]">اشتراک فعال</p>
            <p className="mt-1 text-2xl font-black text-[#163633]">{new Intl.NumberFormat("fa-IR").format(activeCount)}</p>
          </div>
          <div className="rounded-2xl border border-[#E4EBE8] bg-white p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F5F3] text-[#10706B]"><CreditCard size={20} /></div>
            <p className="text-sm text-[#7D8D89]">تعداد اشتراک‌ها</p>
            <p className="mt-1 text-2xl font-black text-[#163633]">{new Intl.NumberFormat("fa-IR").format(subscriptions.length)}</p>
          </div>
          <div className="rounded-2xl border border-[#E4EBE8] bg-white p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F5F3] text-[#10706B]"><Globe2 size={20} /></div>
            <p className="text-sm text-[#7D8D89]">سایت‌های متصل</p>
            <p className="mt-1 text-2xl font-black text-[#163633]">{new Intl.NumberFormat("fa-IR").format(new Set(subscriptions.map((item) => item.siteId).filter(Boolean)).size)}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-48 items-center justify-center gap-3 rounded-2xl border border-[#E4EBE8] bg-white text-sm text-[#7D8D89]">
          <LoaderCircle size={20} className="animate-spin" /> در حال دریافت اطلاعات اشتراک...
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#CFE2DD] bg-white p-8 text-center">
          <CreditCard size={30} className="mx-auto mb-3 text-[#10706B]" />
          <h2 className="font-extrabold text-[#163633]">هنوز اشتراکی برای کسب‌وکار شما ثبت نشده</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#7D8D89]">
            پس از فعال‌سازی اشتراک توسط تیم Agent-To، جزئیات پلن و شناسه سایت در همین صفحه نمایش داده می‌شود.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {subscriptions.map((subscription) => {
            const status = subscription.effectiveStatus || subscription.status;
            const plan = subscription.plan;
            const site = subscription.site;
            return (
              <section key={subscription.id} className="overflow-hidden rounded-2xl border border-[#E4EBE8] bg-white">
                <div className="flex flex-col justify-between gap-4 border-b border-[#EAF0EE] p-5 sm:flex-row sm:items-start sm:p-6">
                  <div className="flex items-start gap-3">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#E4F3EF] text-[#10706B]"><CreditCard size={22} /></span>
                    <div>
                      <h2 className="text-lg font-black text-[#163633]">{plan?.name || "پلن اشتراک"}</h2>
                      {plan?.description && <p className="mt-1 text-sm leading-6 text-[#7D8D89]">{plan.description}</p>}
                      <p className="mt-2 text-sm font-bold text-[#10706B]">{formatPrice(plan?.price, plan?.currency)}{plan?.billingInterval ? ` / ${plan.billingInterval === "YEARLY" ? "سالانه" : "ماهانه"}` : ""}</p>
                    </div>
                  </div>
                  <span className={`w-fit rounded-full px-3 py-1.5 text-xs font-bold ring-1 ring-inset ${statusClasses(status)}`}>{statusLabels[status] || status}</span>
                </div>

                <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
                  <div className="rounded-xl border border-[#EAF0EE] p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-bold text-[#163633]"><CalendarDays size={17} className="text-[#10706B]" /> مدت اعتبار</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><p className="text-xs text-[#7D8D89]">شروع</p><p className="mt-1 text-sm font-bold text-[#163633]">{formatDate(subscription.startsAt)}</p></div>
                      <div><p className="text-xs text-[#7D8D89]">پایان</p><p className="mt-1 text-sm font-bold text-[#163633]">{formatDate(subscription.expiresAt)}</p></div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#EAF0EE] p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-bold text-[#163633]"><Globe2 size={17} className="text-[#10706B]" /> سایت اختصاص‌یافته</div>
                    {site ? (
                      <>
                        <p className="font-bold text-[#163633]">{site.name}</p>
                        <p dir="ltr" className="mt-1 break-all text-sm text-[#7D8D89]">{site.domain}</p>
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#F4FAF8] p-3">
                          <div className="min-w-0"><p className="text-[11px] text-[#7D8D89]">Site ID</p><code dir="ltr" className="break-all text-sm font-black text-[#10706B]">{subscription.siteId || site.siteId}</code></div>
                          <button type="button" onClick={() => void copyValue(subscription.siteId || site.siteId, "Site ID")} className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-[#DDEFEA] bg-white px-3 text-xs font-bold text-[#10706B] hover:bg-[#E8F5F3]"><Copy size={14} /> کپی</button>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm leading-6 text-[#7D8D89]">اطلاعات سایت برای این اشتراک پیدا نشد. با پشتیبانی تماس بگیرید.</p>
                    )}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </CustomerShell>
  );
}
