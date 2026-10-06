import Link from "next/link";
import { Suspense } from "react";
import Shell from "@/components/Shell";
import PageHeader from "@/components/PageHeader";
import { Search, MoreHorizontal, Building2, Users, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import BusinessesError from "./BusinessesError";

interface Business {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string | null;
  status: "ACTIVE" | "SUSPENDED" | "DEACTIVATED";
  createdAt: string;
  updatedAt: string;
}

interface BusinessesResponse {
  success: boolean;
  data: Business[];
}

async function fetchBusinesses(): Promise<Business[]> {
  const response = await api<BusinessesResponse>("/admin/businesses");
  return response.data || [];
}

function BusinessesTable({ businesses }: { businesses: Business[] }) {
  const activeCount = businesses.filter((b) => b.status === "ACTIVE").length;
  const suspendedCount = businesses.filter((b) => b.status === "SUSPENDED").length;
  const deactivatedCount = businesses.filter((b) => b.status === "DEACTIVATED").length;

  return (
    <>
      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <div className="panel p-4">
          <div className="text-xs muted">کل کسب‌وکارها</div>
          <div className="mt-2 text-2xl font-black">{businesses.length}</div>
        </div>
        <div className="panel p-4">
          <div className="text-xs muted">فعال</div>
          <div className="mt-2 text-2xl font-black text-[#10706B]">{activeCount}</div>
        </div>
        <div className="panel p-4">
          <div className="text-xs muted">نیازمند توجه</div>
          <div className="mt-2 text-2xl font-black">{suspendedCount + deactivatedCount}</div>
        </div>
      </div>

      <div className="panel overflow-hidden">
        <div className="flex flex-col gap-3 border-b p-4 md:flex-row">
          <div className="relative flex-1">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 muted" />
            <input className="input pr-9" placeholder="جستجوی نام، دامنه یا slug..." />
          </div>
          <button className="btn-ghost">وضعیت</button>
          <button className="btn-ghost">پلن</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-[#FAFBFB] text-xs muted">
              <tr>
                <th className="px-5 py-4">کسب‌وکار</th>
                <th className="px-5 py-4">Slug</th>
                <th className="px-5 py-4">ایمیل</th>
                <th className="px-5 py-4">وضعیت</th>
                <th className="px-5 py-4">تاریخ ثبت</th>
                <th className="px-5 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {businesses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-muted">
                    هیچ کسب‌وکاری یافت نشد
                  </td>
                </tr>
              ) : (
                businesses.map((business) => (
                  <tr
                    key={business.id}
                    className="border-t hover:bg-[#FCFDFC]"
                    style={{ borderColor: "var(--line)" }}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#E8F5F3] text-[#10706B]">
                          <Building2 size={17} />
                        </div>
                        <div className="font-black">{business.name}</div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs muted">{business.slug}</td>
                    <td className="px-5 py-4 text-xs muted">{business.email}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                          business.status === "ACTIVE"
                            ? "bg-[#EAF7F1] text-[#25825A]"
                            : business.status === "SUSPENDED"
                            ? "bg-[#FFF4E5] text-[#B7791F]"
                            : "bg-[#FDEAEA] text-[#C0392B]"
                        }`}
                      >
                        {business.status === "ACTIVE"
                          ? "فعال"
                          : business.status === "SUSPENDED"
                          ? "معلق"
                          : "غیرفعال"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs muted">
                      {new Date(business.createdAt).toLocaleDateString("fa-IR")}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/businesses/${business.id}`}
                          className="text-xs font-bold text-[#10706B] hover:underline"
                        >
                          مشاهده
                        </Link>
                        <button
                          className="grid h-8 w-8 place-items-center rounded-xl text-muted hover:bg-[#F2F4F3] hover:text-[#0B2B29] transition-colors"
                          aria-label="عملیات بیشتر"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function BusinessesTableSkeleton() {
  return (
    <>
      <div className="mb-5 grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="panel p-4">
            <div className="text-xs muted">Loading...</div>
            <div className="mt-2 h-8 w-24 bg-[#E8ECEB] rounded animate-pulse" />
          </div>
        ))}
      </div>
      <div className="panel overflow-hidden">
        <div className="flex flex-col gap-3 border-b p-4 md:flex-row">
          <div className="relative flex-1">
            <div className="h-10 w-full bg-[#E8ECEB] rounded animate-pulse" />
          </div>
          <div className="h-10 w-24 bg-[#E8ECEB] rounded animate-pulse" />
          <div className="h-10 w-24 bg-[#E8ECEB] rounded animate-pulse" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-[#FAFBFB] text-xs muted">
              <tr>
                <th className="px-5 py-4">کسب‌وکار</th>
                <th className="px-5 py-4">Slug</th>
                <th className="px-5 py-4">ایمیل</th>
                <th className="px-5 py-4">وضعیت</th>
                <th className="px-5 py-4">تاریخ ثبت</th>
                <th className="px-5 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="border-t" style={{ borderColor: "var(--line)" }}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-[#E8ECEB] animate-pulse" />
                      <div className="h-5 w-32 bg-[#E8ECEB] rounded animate-pulse" />
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-4 w-24 bg-[#E8ECEB] rounded animate-pulse" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-4 w-40 bg-[#E8ECEB] rounded animate-pulse" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-6 w-20 bg-[#E8ECEB] rounded animate-pulse" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-4 w-24 bg-[#E8ECEB] rounded animate-pulse" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-6 w-16 bg-[#E8ECEB] rounded animate-pulse" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default function BusinessesPage() {
  return (
    <Shell>
      <PageHeader
        eyebrow="PLATFORM"
        title="کسب‌وکارها"
        description="مدیریت تمام Businessهای ثبت‌شده در AGENT-TO"
        action="افزودن کسب‌وکار"
      />
      <Suspense fallback={<BusinessesTableSkeleton />}>
        <BusinessesTableWrapper />
      </Suspense>
    </Shell>
  );
}

async function BusinessesTableWrapper() {
  try {
    const businesses = await fetchBusinesses();
    return <BusinessesTable businesses={businesses} />;
  } catch {
    return <BusinessesError />;
  }
}