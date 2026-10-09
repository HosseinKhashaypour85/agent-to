"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Shell from "@/components/Shell";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { api } from "@/lib/api";
import {
  ArrowLeft, Building2, Loader2, Search, Store, Plus, Pencil, Trash2, X, RefreshCw,
} from "lucide-react";
import BusinessesError from "./BusinessesError";

type Business = {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  phone: string | null;
  status: "ACTIVE" | "SUSPENDED" | "DEACTIVATED" | string;
  createdAt: string;
  updatedAt: string;
};

type BusinessForm = {
  name: string;
  slug: string;
  email: string;
  phone: string;
  status: "ACTIVE" | "SUSPENDED" | "DEACTIVATED";
};

const EMPTY_FORM: BusinessForm = { name: "", slug: "", email: "", phone: "", status: "ACTIVE" };
const STATUS_LABELS: Record<string, string> = { ACTIVE: "فعال", SUSPENDED: "معلق", DEACTIVATED: "غیرفعال" };
const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-[#EDF8F2] text-[#248357] ring-[#C9EBD9]",
  SUSPENDED: "bg-[#FFF4E5] text-[#B7791F] ring-[#F5E2C0]",
  DEACTIVATED: "bg-[#F1F3F3] text-[#7A8785] ring-[#E2E8E7]",
};
const fa = (n: number) => n.toLocaleString("fa-IR");
const inputClass = "mt-1.5 h-11 w-full rounded-xl border border-[#DCE5E2] bg-white px-3 text-sm text-[#0B2B29] outline-none focus:border-[#10706B] focus:ring-2 focus:ring-[#10706B]/10";

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Business | null>(null);
  const [form, setForm] = useState<BusinessForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const loadBusinesses = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api<{ success: boolean; data: Business[] }>("/admin/businesses");
      setBusinesses(Array.isArray(response.data) ? response.data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "دریافت کسب‌وکارها ناموفق بود");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadBusinesses(); }, [loadBusinesses]);

  const filteredBusinesses = useMemo(() => {
    if (!businesses) return [];
    const query = search.trim().toLowerCase();
    return businesses.filter((b) => {
      const matchesSearch = !query || b.name.toLowerCase().includes(query) ||
        b.slug.toLowerCase().includes(query) || (b.email || "").toLowerCase().includes(query) ||
        (b.phone || "").toLowerCase().includes(query);
      return matchesSearch && (statusFilter === "ALL" || b.status === statusFilter);
    });
  }, [businesses, search, statusFilter]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError("");
    setNotice("");
    setShowForm(true);
  }

  function openEdit(business: Business) {
    setEditing(business);
    setForm({
      name: business.name || "", slug: business.slug || "", email: business.email || "",
      phone: business.phone || "", status: (business.status as BusinessForm["status"]) || "ACTIVE",
    });
    setError("");
    setNotice("");
    setShowForm(true);
  }

  async function submitForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const payload = {
        name: form.name.trim(), slug: form.slug.trim(), email: form.email.trim(),
        phone: form.phone.trim() || null, status: form.status,
      };
      if (editing) {
        await api("/admin/businesses/" + encodeURIComponent(editing.id), {
          method: "PATCH", body: JSON.stringify(payload),
        });
        setNotice("تغییرات کسب‌وکار ذخیره شد.");
      } else {
        await api("/admin/businesses", { method: "POST", body: JSON.stringify(payload) });
        setNotice("کسب‌وکار جدید با موفقیت ایجاد شد.");
      }
      setShowForm(false);
      setEditing(null);
      await loadBusinesses();
    } catch (e) {
      setError(e instanceof Error ? e.message : "ذخیره کسب‌وکار ناموفق بود");
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(business: Business, status: BusinessForm["status"]) {
    setError("");
    setNotice("");
    try {
      await api("/admin/businesses/" + encodeURIComponent(business.id) + "/status", {
        method: "PATCH", body: JSON.stringify({ status }),
      });
      setBusinesses((old) => old?.map((b) => b.id === business.id ? { ...b, status } : b) ?? []);
      setNotice("وضعیت کسب‌وکار تغییر کرد.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "تغییر وضعیت ناموفق بود");
    }
  }

  async function deleteBusiness(business: Business) {
    const confirmed = window.confirm("کسب‌وکار «" + business.name + "» حذف شود؟ این عملیات قابل بازگشت نیست.");
    if (!confirmed) return;
    setDeletingId(business.id);
    setError("");
    setNotice("");
    try {
      await api("/admin/businesses/" + encodeURIComponent(business.id), { method: "DELETE" });
      setBusinesses((old) => old?.filter((b) => b.id !== business.id) ?? []);
      setNotice("کسب‌وکار حذف شد.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "حذف کسب‌وکار ناموفق بود");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading && businesses === null) {
    return <Shell><PageHeader eyebrow="BUSINESSES" title="کسب‌وکارها" description="مدیریت کسب‌وکارهای پلتفرم" />
      <div className="panel flex items-center justify-center gap-3 p-12 text-sm text-[#7A8785]"><Loader2 className="animate-spin" size={18} /> در حال دریافت کسب‌وکارها...</div>
    </Shell>;
  }

  if (error && businesses === null) {
    return <Shell><PageHeader eyebrow="BUSINESSES" title="کسب‌وکارها" description="مدیریت کسب‌وکارهای پلتفرم" />
      <div className="panel p-5"><BusinessesError /><button onClick={() => void loadBusinesses()} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#10706B] px-4 py-2.5 text-sm font-bold text-white"><RefreshCw size={15}/> تلاش دوباره</button><p className="mt-3 text-sm text-red-600">{error}</p></div>
    </Shell>;
  }

  const list = businesses || [];
  const active = list.filter((b) => b.status === "ACTIVE").length;
  const suspended = list.filter((b) => b.status === "SUSPENDED").length;
  const deactivated = list.filter((b) => b.status === "DEACTIVATED").length;

  return (
    <Shell>
      <PageHeader eyebrow="BUSINESSES" title="کسب‌وکارها" description="ایجاد، ویرایش، حذف و مدیریت وضعیت کسب‌وکارهای پلتفرم" />
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-[#7A8785]">تغییرات مستقیماً در سرور ذخیره می‌شوند.</div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-[#10706B] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0B5C57]"><Plus size={17}/> ایجاد کسب‌وکار</button>
      </div>

      {notice && <div role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}
      {error && <div role="alert" className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><span>{error}</span><button onClick={() => setError("")} aria-label="بستن"><X size={16}/></button></div>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="کل کسب‌وکارها" value={fa(list.length)} icon={Store} caption="همه وضعیت‌ها" />
        <StatCard title="فعال" value={fa(active)} icon={Building2} caption="در حال فعالیت" />
        <StatCard title="معلق" value={fa(suspended)} icon={Building2} caption="نیازمند بررسی" />
        <StatCard title="غیرفعال" value={fa(deactivated)} icon={Building2} caption="غیرفعال‌شده" />
      </div>

      <div className="mt-6 panel overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-[#E8ECEB] px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div><h2 className="text-[15px] font-black text-[#0B2B29]">فهرست کسب‌وکارها</h2><p className="mt-1 text-[11px] font-medium text-[#9AA5A3]">{fa(filteredBusinesses.length)} کسب‌وکار</p></div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative"><Search size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9AA5A3]"/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجوی نام، دامنه، ایمیل..." className="h-10 w-full rounded-xl border border-[#E1E7E5] bg-white pr-10 pl-4 text-xs text-[#0B2B29] outline-none focus:border-[#10706B] sm:w-64"/></div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 rounded-xl border border-[#E1E7E5] bg-white px-3 text-xs font-bold text-[#4A5856] outline-none focus:border-[#10706B]"><option value="ALL">همه وضعیت‌ها</option><option value="ACTIVE">فعال</option><option value="SUSPENDED">معلق</option><option value="DEACTIVATED">غیرفعال</option></select>
            <button onClick={() => void loadBusinesses()} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#E1E7E5] px-3 text-xs font-bold text-[#4A5856] hover:bg-[#F8FAFA]"><RefreshCw size={14}/> بروزرسانی</button>
          </div>
        </div>

        {filteredBusinesses.length === 0 ? <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#E8F5F3] text-[#10706B]"><Store size={24}/></span><div className="text-sm font-bold text-[#0B2B29]">{list.length === 0 ? "هنوز کسب‌وکاری ثبت نشده" : "نتیجه‌ای پیدا نشد"}</div><div className="text-xs text-[#7A8785]">{list.length === 0 ? "برای شروع، اولین کسب‌وکار را ایجاد کن." : "فیلتر یا عبارت جستجو را تغییر بده."}</div></div> : (
          <div className="overflow-x-auto"><table className="w-full min-w-[1000px] text-right"><thead><tr className="border-b border-[#E8ECEB] bg-[#F8FAFA] text-[11px] font-bold text-[#7A8785]"><th className="px-5 py-3">کسب‌وکار</th><th className="px-5 py-3">ایمیل</th><th className="px-5 py-3">تلفن</th><th className="px-5 py-3">وضعیت</th><th className="px-5 py-3">تاریخ ایجاد</th><th className="px-5 py-3">عملیات</th></tr></thead>
            <tbody className="divide-y divide-[#EEF2F1] text-xs">{filteredBusinesses.map((business) => <tr key={business.id} className="transition-colors hover:bg-[#F7FAF9]">
              <td className="px-5 py-4"><div className="font-bold text-[#0B2B29]">{business.name}</div><div className="mt-0.5 text-[10px] text-[#9AA5A3]">{business.slug}</div></td>
              <td className="px-5 py-4 text-[#4A5856]">{business.email || "—"}</td><td className="px-5 py-4 text-[#4A5856]">{business.phone || "—"}</td>
              <td className="px-5 py-4"><select aria-label={"وضعیت " + business.name} value={business.status} onChange={(e) => void changeStatus(business, e.target.value as BusinessForm["status"])} className={"rounded-lg border-0 px-2.5 py-1.5 text-[11px] font-bold ring-1 " + (STATUS_STYLES[business.status] || "bg-gray-100 text-gray-700 ring-gray-200")}><option value="ACTIVE">فعال</option><option value="SUSPENDED">معلق</option><option value="DEACTIVATED">غیرفعال</option></select></td>
              <td className="px-5 py-4 text-[#7A8785]">{business.createdAt ? new Date(business.createdAt).toLocaleDateString("fa-IR") : "—"}</td>
              <td className="px-5 py-4"><div className="flex items-center gap-2">
                <button onClick={() => openEdit(business)} className="inline-flex items-center gap-1.5 rounded-lg bg-[#E8F5F3] px-3 py-2 text-[11px] font-bold text-[#10706B] hover:bg-[#DDF0ED]"><Pencil size={13}/> ویرایش</button>
                <Link href={"/businesses/" + business.id} className="inline-flex items-center gap-1.5 rounded-lg border border-[#E1E7E5] px-3 py-2 text-[11px] font-bold text-[#4A5856] hover:bg-[#F8FAFA]">جزئیات <ArrowLeft size={13}/></Link>
                <button disabled={deletingId === business.id} onClick={() => void deleteBusiness(business)} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-[11px] font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"><Trash2 size={13}/>{deletingId === business.id ? "در حال حذف" : "حذف"}</button>
              </div></td>
            </tr>)}</tbody></table></div>
        )}
      </div>

      {showForm && <div role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget && !saving) setShowForm(false); }} className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#071D1B]/50 p-4 backdrop-blur-sm">
        <div role="dialog" aria-modal="true" aria-labelledby="business-form-title" className="my-auto w-full max-w-xl rounded-2xl border border-[#E8ECEB] bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#E8ECEB] px-5 py-4"><div><h2 id="business-form-title" className="text-lg font-black text-[#0B2B29]">{editing ? "ویرایش کسب‌وکار" : "ایجاد کسب‌وکار جدید"}</h2><p className="mt-1 text-xs text-[#7A8785]">اطلاعات را وارد کن و ذخیره را بزن.</p></div><button disabled={saving} onClick={() => setShowForm(false)} className="rounded-lg p-2 text-[#7A8785] hover:bg-[#F1F5F4]" aria-label="بستن"><X size={18}/></button></div>
          <form onSubmit={submitForm} className="grid gap-4 p-5">
            <label className="text-xs font-bold text-[#4A5856]">نام کسب‌وکار<input required maxLength={191} value={form.name} onChange={(e) => setForm((f) => ({...f,name:e.target.value}))} className={inputClass} placeholder="مثلاً فروشگاه نمونه"/></label>
            <label className="text-xs font-bold text-[#4A5856]">شناسه / اسلاگ<input required maxLength={191} value={form.slug} onChange={(e) => setForm((f) => ({...f,slug:e.target.value}))} className={inputClass} placeholder="example-store"/><span className="mt-1 block font-normal text-[#9AA5A3]">فقط حروف انگلیسی، عدد و خط تیره پیشنهاد می‌شود.</span></label>
            <label className="text-xs font-bold text-[#4A5856]">ایمیل<input required type="email" maxLength={191} value={form.email} onChange={(e) => setForm((f) => ({...f,email:e.target.value}))} className={inputClass} placeholder="owner@example.com"/></label>
            <label className="text-xs font-bold text-[#4A5856]">شماره تماس<input value={form.phone} maxLength={50} onChange={(e) => setForm((f) => ({...f,phone:e.target.value}))} className={inputClass} placeholder="اختیاری"/></label>
            <label className="text-xs font-bold text-[#4A5856]">وضعیت<select value={form.status} onChange={(e) => setForm((f) => ({...f,status:e.target.value as BusinessForm["status"]}))} className={inputClass}><option value="ACTIVE">فعال</option><option value="SUSPENDED">معلق</option><option value="DEACTIVATED">غیرفعال</option></select></label>
            {error && <div role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
            <div className="mt-1 flex justify-end gap-2"><button type="button" disabled={saving} onClick={() => setShowForm(false)} className="rounded-xl border border-[#DCE5E2] px-4 py-2.5 text-sm font-bold text-[#4A5856] hover:bg-[#F8FAFA]">انصراف</button><button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-[#10706B] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0B5C57] disabled:opacity-60">{saving && <Loader2 size={15} className="animate-spin"/>}{saving ? "در حال ذخیره..." : editing ? "ذخیره تغییرات" : "ایجاد کسب‌وکار"}</button></div>
          </form>
        </div>
      </div>}
    </Shell>
  );
}
