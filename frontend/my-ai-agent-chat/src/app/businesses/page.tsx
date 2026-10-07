"use client";

import { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { api } from "@/lib/api";
import { Building2, Loader2, Store } from "lucide-react";
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

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(false);

    api<{ success: boolean; data: Business[] }>("/admin/businesses")
      .then((response) => {
        if (!cancelled) {
          setBusinesses(Array.isArray(response.data) ? response.data : []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

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
              <div className="mt-5 h-7 w-24 bg-[#E8ECEB] rounded animate-pulse" />
              <div className="mt-2 h-4 w-32 bg-[#E8ECEB] rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="mt-6 panel overflow-hidden">
          <div className="h-12 bg-[#E8ECEB] animate-pulse" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 border-t border-[#E8ECEB] bg-[#F8FAFA] animate-pulse" />
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
  const active = businesses.filter((b) => b.status === "ACTIVE").length;
  const suspended = businesses.filter((b) => b.status === "SUSPENDED").length;
  const deactivated = businesses.filter((b) => b.status === "DEACTIVATED").length;

  return (
    <Shell>
      <PageHeader
        eyebrow="BUSINESSES"
        title="کسب‌وکارها"
        description="مدیریت و مشاهده وضعیت کسب‌وکارهای پلتفرم"
      />

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

      <div className="mt-6 panel overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#E8ECEB] px-5 py-4">
          <h2 className="text-[15px] font-black text-[#0B2B29]">
            فهرست کسب‌وکارها
          </h2>
          <span className="text-xs font-bold text-[#7A8785]">
            {fa(total)} مورد
          </span>
        </div>

        {businesses.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#E8F5F3] text-[#10706B]">
              <Store size={24} strokeWidth={2.2} />
            </span>
            <div className="text-sm font-bold text-[#0B2B29]">
              هیچ کسب‌وکاری یافت نشد
            </div>
            <div className="text-xs text-[#7A8785]">
              کسب‌وکارهای جدید در اینجا نمایش داده می‌شوند.
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-right">
              <thead>
                <tr className="border-b border-[#E8ECEB] bg-[#F8FAFA] text-[11px] font-bold text-[#7A8785]">
                  <th className="px-5 py-3">کسب‌وکار</th>
                  <th className="px-5 py-3">ایمیل</th>
                  <th className="px-5 py-3">تلفن</th>
                  <th className="px-5 py-3">وضعیت</th>
                  <th className="px-5 py-3">تاریخ ایجاد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF2F1] text-xs">
                {businesses.map((b) => (
                  <tr
                    key={b.id}
                    className="transition-colors hover:bg-[#F7FAF9]"
                  >
                    <td className="px-5 py-4">
                      <div className="font-bold text-[#0B2B29]">{b.name}</div>
                      <div className="mt-0.5 text-[10px] font-medium text-[#9AA5A3]">
                        {b.slug}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-medium text-[#4A5856]">
                      {b.email || "—"}
                    </td>
                    <td className="px-5 py-4 font-medium text-[#4A5856]">
                      {b.phone || "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={[
                          "inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-bold ring-1",
                          STATUS_STYLES[b.status] ||
                            "bg-[#F1F3F3] text-[#7A8785] ring-[#E2E8E7]",
                        ].join(" ")}
                      >
                        {STATUS_LABELS[b.status] || b.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-medium text-[#7A8785]">
                      {new Date(b.createdAt).toLocaleString("fa-IR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 text-[11px] font-medium text-[#9AA5A3]">
        <Loader2 size={12} className="hidden" />
        {fa(total)} کسب‌وکار در مجموع
      </div>
    </Shell>
  );
}
