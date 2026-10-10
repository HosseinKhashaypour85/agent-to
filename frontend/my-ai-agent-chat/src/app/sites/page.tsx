"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Shell from "@/components/Shell";
import PageHeader from "@/components/PageHeader";
import { api } from "@/lib/api";
import {
  Globe, Search, RefreshCw, Loader2, CheckCircle2, Clock3,
  Ban, Wrench, KeyRound, Copy, ExternalLink, X,
} from "lucide-react";

type SiteStatus = "INSTALLING" | "ACTIVE" | "INACTIVE";
type Site = {
  id: string;
  siteId: string;
  name: string;
  domain: string;
  status: SiteStatus;
  tenantId: string;
  tenantName: string;
  createdAt: string;
  updatedAt: string;
  subscription: null | {
    id: string;
    status: string;
    startsAt: string;
    expiresAt: string;
  };
};
type InstallToken = {
  token: string;
  expiresAt: string;
  siteId: string;
  domain: string;
};

const statusLabels: Record<SiteStatus, string> = {
  INSTALLING: "در انتظار نصب",
  ACTIVE: "فعال",
  INACTIVE: "غیرفعال",
};
const statusClasses: Record<SiteStatus, string> = {
  INSTALLING: "bg-amber-50 text-amber-700 ring-amber-200",
  ACTIVE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  INACTIVE: "bg-slate-100 text-slate-600 ring-slate-200",
};
const fa = (value: number) => value.toLocaleString("fa-IR");
const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(date);
};

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [busyId, setBusyId] = useState("");
  const [tokenResult, setTokenResult] = useState<InstallToken | null>(null);

  const loadSites = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api<{ success: boolean; sites: Site[] }>("/admin/sites");
      setSites(Array.isArray(response.sites) ? response.sites : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "دریافت سایت‌ها ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadSites(); }, [loadSites]);

  const filteredSites = useMemo(() => {
    const query = search.trim().toLowerCase();
    return sites.filter((site) => {
      const matchesQuery = !query || [
        site.name, site.siteId, site.domain, site.tenantName,
      ].some((value) => (value || "").toLowerCase().includes(query));
      return matchesQuery && (filterStatus === "ALL" || site.status === filterStatus);
    });
  }, [sites, search, filterStatus]);

  async function changeStatus(site: Site, status: SiteStatus) {
    if (site.status === status) return;
    setBusyId(site.id);
    setError("");
    setNotice("");
    try {
      const response = await api<{ success: boolean; site: { status: SiteStatus } }>(
        `/admin/sites/${encodeURIComponent(site.id)}/status`,
        { method: "PATCH", body: JSON.stringify({ status }) }
      );
      setSites((current) => current.map((item) =>
        item.id === site.id ? { ...item, status: response.site.status } : item
      ));
      setNotice(`وضعیت سایت ${site.siteId} به «${statusLabels[status]}» تغییر کرد.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تغییر وضعیت سایت ناموفق بود.");
    } finally {
      setBusyId("");
    }
  }

  async function generateToken(site: Site) {
    setBusyId(site.id);
    setError("");
    setNotice("");
    setTokenResult(null);
    try {
      const response = await api<InstallToken>(
        `/admin/sites/${encodeURIComponent(site.id)}/install-token`,
        { method: "POST", body: JSON.stringify({}) }
      );
      setTokenResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ساخت توکن نصب ناموفق بود.");
    } finally {
      setBusyId("");
    }
  }

  async function copyToken() {
    if (!tokenResult?.token) return;
    try {
      await navigator.clipboard.writeText(tokenResult.token);
      setNotice("توکن در کلیپ‌بورد کپی شد.");
    } catch {
      setError("کپی خودکار انجام نشد؛ توکن را دستی کپی کن.");
    }
  }

  const activeCount = sites.filter((site) => site.status === "ACTIVE").length;
  const installingCount = sites.filter((site) => site.status === "INSTALLING").length;
  const inactiveCount = sites.filter((site) => site.status === "INACTIVE").length;

  return (
    <Shell>
      <PageHeader
        eyebrow="SITE MANAGEMENT"
        title="مدیریت سایت‌ها"
        description="مشاهده سایت‌های متصل به اشتراک‌ها، کنترل وضعیت و ساخت توکن نصب."
        action={
          <button onClick={() => void loadSites()} disabled={loading}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#DDE5E4] bg-white px-4 text-sm font-bold text-[#24413F] hover:bg-[#F5F8F7] disabled:opacity-50">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> بروزرسانی
          </button>
        }
      />

      {error && <div role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}
      {notice && <div role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{notice}</div>}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "کل سایت‌ها", value: sites.length, icon: Globe },
          { label: "فعال", value: activeCount, icon: CheckCircle2 },
          { label: "در انتظار نصب", value: installingCount, icon: Clock3 },
          { label: "غیرفعال", value: inactiveCount, icon: Ban },
        ].map((item) => {
          const Icon = item.icon;
          return <div key={item.label} className="panel p-5">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-slate-500">{item.label}</p><p className="mt-2 text-2xl font-black text-slate-900">{fa(item.value)}</p></div>
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#10706B]/10 text-[#10706B]"><Icon size={21} /></div>
            </div>
          </div>;
        })}
      </div>

      <div className="panel overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[#E8ECEB] p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search size={17} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجو نام، Site ID، دامنه یا کسب‌وکار"
              className="h-11 w-full rounded-xl border border-[#DDE5E4] bg-white pr-10 pl-3 text-sm outline-none focus:border-[#10706B]" />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="h-11 rounded-xl border border-[#DDE5E4] bg-white px-3 text-sm outline-none focus:border-[#10706B]">
            <option value="ALL">همه وضعیت‌ها</option>
            <option value="INSTALLING">در انتظار نصب</option>
            <option value="ACTIVE">فعال</option>
            <option value="INACTIVE">غیرفعال</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 p-14 text-sm text-slate-500"><Loader2 className="animate-spin" size={20} /> در حال دریافت سایت‌ها...</div>
        ) : filteredSites.length === 0 ? (
          <div className="p-14 text-center">
            <Globe className="mx-auto mb-3 text-slate-300" size={34} />
            <p className="font-bold text-slate-700">سایتی پیدا نشد</p>
            <p className="mt-1 text-sm text-slate-500">سایت‌ها هنگام ساخت اشتراک ایجاد می‌شوند.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-right text-sm">
              <thead className="bg-[#F7F9F8] text-xs text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-bold">سایت</th>
                  <th className="px-5 py-4 font-bold">کسب‌وکار</th>
                  <th className="px-5 py-4 font-bold">اشتراک</th>
                  <th className="px-5 py-4 font-bold">وضعیت سایت</th>
                  <th className="px-5 py-4 font-bold">تاریخ ایجاد</th>
                  <th className="px-5 py-4 font-bold">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {filteredSites.map((site) => (
                  <tr key={site.id} className="border-t border-[#EEF1F0] align-top hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <p className="font-black text-slate-900">{site.name}</p>
                      <p className="mt-1 font-mono text-xs text-[#10706B]">{site.siteId}</p>
                      <a href={site.domain.startsWith("http") ? site.domain : `https://${site.domain}`}
                        target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-[#10706B]">
                        {site.domain} <ExternalLink size={11} />
                      </a>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">{site.tenantName}</p>
                      <p className="mt-1 text-[11px] text-slate-400">{site.tenantId}</p>
                    </td>
                    <td className="px-5 py-4">
                      {site.subscription ? <>
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${site.subscription.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{site.subscription.status}</span>
                        <p className="mt-2 text-xs text-slate-500">پایان: {formatDate(site.subscription.expiresAt)}</p>
                      </> : <span className="text-slate-400">بدون اشتراک</span>}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${statusClasses[site.status]}`}>{statusLabels[site.status]}</span>
                      <select aria-label={`تغییر وضعیت ${site.siteId}`} value={site.status}
                        disabled={busyId === site.id}
                        onChange={(e) => void changeStatus(site, e.target.value as SiteStatus)}
                        className="mt-2 block h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs disabled:opacity-50">
                        <option value="INSTALLING">در انتظار نصب</option>
                        <option value="ACTIVE">فعال</option>
                        <option value="INACTIVE">غیرفعال</option>
                      </select>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">{formatDate(site.createdAt)}</td>
                    <td className="px-5 py-4">
                      <button onClick={() => void generateToken(site)} disabled={busyId === site.id}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#10706B] px-3 py-2 text-xs font-bold text-white hover:bg-[#0B5C58] disabled:opacity-50">
                        {busyId === site.id ? <Loader2 size={14} className="animate-spin" /> : <KeyRound size={14} />}
                        توکن نصب
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="border-t border-[#E8ECEB] px-5 py-3 text-xs text-slate-500">نمایش {fa(filteredSites.length)} از {fa(sites.length)} سایت</div>
      </div>

      {tokenResult && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true" aria-labelledby="install-token-title">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="install-token-title" className="text-lg font-black text-slate-900">توکن نصب سایت</h2>
                <p className="mt-1 text-sm text-slate-500">{tokenResult.siteId} · {tokenResult.domain}</p>
              </div>
              <button onClick={() => setTokenResult(null)} aria-label="بستن" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={18} /></button>
            </div>
            <p className="mt-5 text-sm text-amber-700">این توکن فقط برای یک بار نصب قابل استفاده است و پس از ۳۰ دقیقه منقضی می‌شود. آن را در اختیار افراد غیرمجاز قرار نده.</p>
            <div className="mt-3 break-all rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-800">{tokenResult.token}</div>
            <p className="mt-2 text-xs text-slate-500">انقضا: {new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(tokenResult.expiresAt))}</p>
            <button onClick={() => void copyToken()} className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#10706B] px-4 text-sm font-bold text-white hover:bg-[#0B5C58]"><Copy size={16} /> کپی توکن</button>
          </div>
        </div>
      )}
    </Shell>
  );
}
