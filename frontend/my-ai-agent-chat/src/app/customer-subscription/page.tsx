"use client";

import { useCallback, useEffect, useState } from "react";
import CustomerShell from "@/components/CustomerShell";
import { api } from "@/lib/api";
import { AlertCircle, CheckCircle2, Copy, Globe2, LoaderCircle, RefreshCw } from "lucide-react";

type Site = {
  id: string;
  siteId: string;
  name: string;
  domain: string;
  status: "INSTALLING" | "ACTIVE" | "INACTIVE";
  createdAt?: string;
};

const statusLabels: Record<Site["status"], string> = {
  INSTALLING: "در انتظار نصب",
  ACTIVE: "فعال",
  INACTIVE: "غیرفعال",
};

export default function CustomerSubscriptionPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadSites = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await api<{ success?: boolean; data?: Site[] }>("/sites");
      setSites(result.data || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "دریافت اطلاعات سایت ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSites();
  }, [loadSites]);

  async function copySiteId(siteId: string) {
    try {
      await navigator.clipboard.writeText(siteId);
      setNotice("Site ID کپی شد.");
      window.setTimeout(() => setNotice(""), 2500);
    } catch {
      setError("کپی شناسه انجام نشد؛ آن را به‌صورت دستی انتخاب کنید.");
    }
  }

  return (
    <CustomerShell>
      <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-bold text-[#10706B]">حساب کاربری</p>
          <h1 className="text-2xl font-black text-[#163633]">اشتراک و شناسه سایت</h1>
          <p className="mt-2 text-sm text-[#7D8D89]">
            Site ID توسط سوپرادمین هنگام ثبت اشتراک تخصیص داده می‌شود و برای اتصال ایجنت و نصب افزونه استفاده می‌شود.
          </p>
        </div>
        <button type="button" onClick={() => void loadSites()} disabled={loading} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#DDEFEA] bg-[#E8F5F3] px-4 text-sm font-bold text-[#10706B] hover:bg-[#DDEFEA] disabled:opacity-50">
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          تازه‌سازی
        </button>
      </div>

      {notice && <div role="status" className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"><CheckCircle2 size={18} /> {notice}</div>}
      {error && <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"><AlertCircle size={18} className="mt-0.5 shrink-0" /><span>{error}</span></div>}

      {loading ? (
        <div className="flex min-h-48 items-center justify-center gap-3 rounded-2xl border border-[#E4EBE8] bg-white text-sm text-[#7D8D89]">
          <LoaderCircle size={20} className="animate-spin" /> در حال دریافت شناسه‌های تخصیص‌یافته...
        </div>
      ) : sites.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#CFE2DD] bg-white p-8 text-center">
          <Globe2 size={30} className="mx-auto mb-3 text-[#10706B]" />
          <h2 className="font-extrabold text-[#163633]">هنوز شناسه‌ای تخصیص داده نشده</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#7D8D89]">
            پس از ثبت اشتراک و تخصیص سایت توسط سوپرادمین، Site ID و دامنه در همین صفحه نمایش داده می‌شوند.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {sites.map((site) => (
            <section key={site.id} className="rounded-2xl border border-[#E4EBE8] bg-white p-5 sm:p-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#E4F3EF] text-[#10706B]"><Globe2 size={21} /></span>
                  <div>
                    <h2 className="font-extrabold text-[#163633]">{site.name}</h2>
                    <p className="mt-1 text-sm text-[#7D8D89]" dir="ltr">{site.domain}</p>
                  </div>
                </div>
                <span className="w-fit rounded-full bg-[#E8F5F3] px-3 py-1.5 text-xs font-bold text-[#10706B]">{statusLabels[site.status] || site.status}</span>
              </div>
              <div className="mt-5 rounded-xl border border-[#DDEFEA] bg-[#F7FBFA] p-4">
                <div className="mb-2 text-xs font-bold text-[#7D8D89]">شناسه اختصاصی سایت (Site ID)</div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <code dir="ltr" className="min-w-0 flex-1 break-all text-base font-black tracking-wide text-[#10706B]">{site.siteId}</code>
                  <button type="button" onClick={() => void copySiteId(site.siteId)} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#DDEFEA] bg-white px-3 text-sm font-bold text-[#10706B] hover:bg-[#E8F5F3]"><Copy size={15} /> کپی شناسه</button>
                </div>
              </div>
            </section>
          ))}
        </div>
      )}
    </CustomerShell>
  );
}
