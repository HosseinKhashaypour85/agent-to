"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Shell from "@/components/Shell";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { api } from "@/lib/api";
import {
  ArrowLeft,
  Building2,
  Loader2,
  Search,
  Plus,
  X,
  Store,
} from "lucide-react";
import BusinessesError from "./BusinessesError";

type Business = {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  phone: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "فعال",
  SUSPENDED: "معلق",
  DEACTIVATED: "غیرفعال",
};

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-[#EDF8F2] text-[#248357] ring-[#C9EBD9]",
  SUSPENDED: "bg-[#FFF4E5] text-[#B7791F] ring-[#F5E2C0]",
  DEACTIVATED: "bg-[#F1F3F3] text-[#7A8785] ring-[#E2E8E7]",
};

const fa = (n: number) => n.toLocaleString("fa-IR");

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [form, setForm] = useState({ name: "", slug: "", email: "", phone: "", ownerFirstName: "", ownerLastName: "", ownerEmail: "", ownerPassword: "" });

  async function handleCreateBusiness(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setCreateError("");
    try {
      const result = await api<{ success: boolean; data: Business; message?: string }>("/admin/businesses", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setBusinesses((current) => [result.data, ...(current || [])]);
      setCreateOpen(false);
      setForm({ name: "", slug: "", email: "", phone: "", ownerFirstName: "", ownerLastName: "", ownerEmail: "", ownerPassword: "" });
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "ساخت کسب‌وکار ناموفق بود.");
    } finally {
      setCreating(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function loadBusinesses() {
      try {
        setLoading(true);
        setError(false);

        const response = await api<{
          success: boolean;
          data: Business[];
        }>("/admin/businesses");

        if (!cancelled) {
          setBusinesses(
            Array.isArray(response.data) ? response.data : []
          );
        }
      } catch (error) {
        console.error("BUSINESSES LOAD ERROR:", error);

        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadBusinesses();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredBusinesses = useMemo(() => {
    if (!businesses) return [];

    const query = search.trim().toLowerCase();

    return businesses.filter((business) => {
      const matchesSearch =
        !query ||
        business.name.toLowerCase().includes(query) ||
        business.slug.toLowerCase().includes(query) ||
        (business.email || "").toLowerCase().includes(query) ||
        (business.phone || "").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        business.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [businesses, search, statusFilter]);

  if (loading) {
    return (
      <Shell>
        <PageHeader
          eyebrow="BUSINESSES"
          title="کسب‌وکارها"
          description="مدیریت و مشاهده وضعیت کسب‌وکارهای پلتفرم"
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="panel p-5">
              <div className="h-11 w-11 rounded-xl bg-[#E8ECEB] animate-pulse" />
              <div className="mt-5 h-7 w-24 rounded bg-[#E8ECEB] animate-pulse" />
              <div className="mt-2 h-4 w-32 rounded bg-[#E8ECEB] animate-pulse" />
            </div>
          ))}
        </div>

        <div className="mt-6 panel overflow-hidden">
          <div className="h-12 bg-[#E8ECEB] animate-pulse" />

          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-16 border-t border-[#E8ECEB] bg-[#F8FAFA] animate-pulse"
            />
          ))}
        </div>
      </Shell>
    );
  }

  if (error || businesses === null) {
    return (
      <Shell>
        <PageHeader
          eyebrow="BUSINESSES"
          title="کسب‌وکارها"
          description="مدیریت و مشاهده وضعیت کسب‌وکارهای پلتفرم"
        />

        <div className="panel">
          <BusinessesError />
        </div>
      </Shell>
    );
  }

  const total = businesses.length;

  const active = businesses.filter(
    (b) => b.status === "ACTIVE"
  ).length;

  const suspended = businesses.filter(
    (b) => b.status === "SUSPENDED"
  ).length;

  const deactivated = businesses.filter(
    (b) => b.status === "DEACTIVATED"
  ).length;

  return (
    <Shell>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          eyebrow="BUSINESSES"
          title="کسب‌وکارها"
          description="مدیریت و مشاهده وضعیت کسب‌وکارهای پلتفرم"
        />
        <button type="button" onClick={() => { setCreateError(""); setCreateOpen(true); }} className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#10706B] px-4 text-sm font-bold text-white transition hover:bg-[#0B5C58]">
          <Plus size={17} /> ایجاد کسب‌وکار
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="کل کسب‌وکارها"
          value={fa(total)}
          icon={Store}
          caption="همه وضعیت‌ها"
        />

        <StatCard
          title="فعال"
          value={fa(active)}
          icon={Building2}
          caption="کسب‌وکارهای در حال فعالیت"
        />

        <StatCard
          title="معلق"
          value={fa(suspended)}
          icon={Building2}
          caption="نیازمند بررسی"
        />

        <StatCard
          title="غیرفعال"
          value={fa(deactivated)}
          icon={Building2}
          caption="حذف‌شده یا غیرفعال"
        />
      </div>

      {/* Table */}
      <div className="mt-6 panel overflow-hidden">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-[#E8ECEB] px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-[15px] font-black text-[#0B2B29]">
              فهرست کسب‌وکارها
            </h2>

            <p className="mt-1 text-[11px] font-medium text-[#9AA5A3]">
              {fa(filteredBusinesses.length)} کسب‌وکار نمایش داده می‌شود
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            {/* Search */}
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9AA5A3]"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="جستجوی کسب‌وکار..."
                className="h-10 w-full rounded-xl border border-[#E1E7E5] bg-white pr-10 pl-4 text-xs font-medium text-[#0B2B29] outline-none transition placeholder:text-[#A5AFAD] focus:border-[#10706B] focus:ring-2 focus:ring-[#10706B]/10 sm:w-64"
              />
            </div>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-xl border border-[#E1E7E5] bg-white px-3 text-xs font-bold text-[#4A5856] outline-none focus:border-[#10706B] focus:ring-2 focus:ring-[#10706B]/10"
            >
              <option value="ALL">همه وضعیت‌ها</option>
              <option value="ACTIVE">فعال</option>
              <option value="SUSPENDED">معلق</option>
              <option value="DEACTIVATED">غیرفعال</option>
            </select>
          </div>
        </div>

        {/* Empty */}
        {filteredBusinesses.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#E8F5F3] text-[#10706B]">
              <Store size={24} strokeWidth={2.2} />
            </span>

            <div className="text-sm font-bold text-[#0B2B29]">
              {businesses.length === 0
                ? "هیچ کسب‌وکاری یافت نشد"
                : "نتیجه‌ای پیدا نشد"}
            </div>

            <div className="text-xs text-[#7A8785]">
              {businesses.length === 0
                ? "کسب‌وکارهای جدید در اینجا نمایش داده می‌شوند."
                : "فیلتر یا عبارت جستجو را تغییر دهید."}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-right">
              <thead>
                <tr className="border-b border-[#E8ECEB] bg-[#F8FAFA] text-[11px] font-bold text-[#7A8785]">
                  <th className="px-5 py-3">کسب‌وکار</th>
                  <th className="px-5 py-3">ایمیل</th>
                  <th className="px-5 py-3">تلفن</th>
                  <th className="px-5 py-3">وضعیت</th>
                  <th className="px-5 py-3">تاریخ ایجاد</th>
                  <th className="px-5 py-3">عملیات</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#EEF2F1] text-xs">
                {filteredBusinesses.map((business) => (
                  <tr
                    key={business.id}
                    className="transition-colors hover:bg-[#F7FAF9]"
                  >
                    {/* Business */}
                    <td className="px-5 py-4">
                      <div className="font-bold text-[#0B2B29]">
                        {business.name}
                      </div>

                      <div className="mt-0.5 text-[10px] font-medium text-[#9AA5A3]">
                        {business.slug}
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-5 py-4 font-medium text-[#4A5856]">
                      {business.email || "—"}
                    </td>

                    {/* Phone */}
                    <td className="px-5 py-4 font-medium text-[#4A5856]">
                      {business.phone || "—"}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span
                        className={[
                          "inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-bold ring-1",
                          STATUS_STYLES[business.status] ||
                            "bg-[#F1F3F3] text-[#7A8785] ring-[#E2E8E7]",
                        ].join(" ")}
                      >
                        {STATUS_LABELS[business.status] ||
                          business.status}
                      </span>
                    </td>

                    {/* Created */}
                    <td className="px-5 py-4 font-medium text-[#7A8785]">
                      {new Date(
                        business.createdAt
                      ).toLocaleString("fa-IR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <Link
                        href={`/businesses/${business.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#E8F5F3] px-3 py-2 text-[11px] font-bold text-[#10706B] transition hover:bg-[#DDF0ED]"
                      >
                        مشاهده
                        <ArrowLeft size={13} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#0B2B29]/50 p-4" role="dialog" aria-modal="true" aria-labelledby="create-business-title">
          <form onSubmit={handleCreateBusiness} className="my-6 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 id="create-business-title" className="text-lg font-black text-[#0B2B29]">ایجاد کسب‌وکار و حساب مشتری</h2>
                <p className="mt-1 text-xs text-[#7A8785]">اطلاعات ورود این بخش برای پنل مشتریان استفاده می‌شود.</p>
              </div>
              <button type="button" onClick={() => setCreateOpen(false)} aria-label="بستن" className="rounded-lg p-2 text-[#7A8785] hover:bg-[#F1F5F4]"><X size={18} /></button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["name","نام کسب‌وکار","مثلاً فروشگاه من","text"],
                ["slug","شناسه انگلیسی","my-store","text"],
                ["email","ایمیل کسب‌وکار","info@example.com","email"],
                ["phone","شماره تماس","09...","tel"],
                ["ownerFirstName","نام مدیر","حسین","text"],
                ["ownerLastName","نام خانوادگی مدیر","خسای‌پور","text"],
                ["ownerEmail","ایمیل ورود پنل مشتری","admin@example.com","email"],
                ["ownerPassword","رمز عبور اولیه (حداقل ۸ کاراکتر)","••••••••","password"],
              ].map(([key,label,placeholder,type]) => (
                <label key={key} className="block text-xs font-bold text-[#4A5856]">
                  {label}
                  <input required={key !== "phone" && key !== "ownerFirstName" && key !== "ownerLastName"} type={type} minLength={key === "ownerPassword" ? 8 : undefined} autoComplete={key === "ownerPassword" ? "new-password" : "off"} value={form[key as keyof typeof form]} onChange={(e) => setForm((current) => ({ ...current, [key]: e.target.value, ...(key === "name" && !current.slug ? { slug: e.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") } : {}) }))} placeholder={placeholder} className="mt-1.5 h-11 w-full rounded-xl border border-[#E1E7E5] px-3 text-sm font-medium outline-none focus:border-[#10706B] focus:ring-2 focus:ring-[#10706B]/10" />
                </label>
              ))}
            </div>
            {createError && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700">{createError}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setCreateOpen(false)} className="rounded-xl border border-[#E1E7E5] px-4 py-2.5 text-sm font-bold text-[#4A5856]">انصراف</button>
              <button type="submit" disabled={creating} className="inline-flex items-center gap-2 rounded-xl bg-[#10706B] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">{creating && <Loader2 size={15} className="animate-spin" />}{creating ? "در حال ایجاد..." : "ایجاد حساب مشتری"}</button>
            </div>
          </form>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 flex items-center justify-center gap-2 text-[11px] font-medium text-[#9AA5A3]">
        <Loader2 size={12} className="hidden" />
        {fa(filteredBusinesses.length)} کسب‌وکار نمایش داده شد
      </div>
    </Shell>
  );
}