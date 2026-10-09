"use client";

import { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { api } from "@/lib/api";
import {
  Building2,
  CreditCard,
  Users,
  Bot,
  ArrowLeft,
  Activity,
  Sparkles,
  TrendingUp,
  CircleDot,
  Loader2,
  AlertCircle,
} from "lucide-react";

const fa = (n: number) => n.toLocaleString("fa-IR");

function faRelativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) {
    return "همین حالا";
  }

  if (minutes < 60) {
    return `${fa(minutes)} دقیقه پیش`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${fa(hours)} ساعت پیش`;
  }

  const days = Math.floor(hours / 24);

  if (days < 30) {
    return `${fa(days)} روز پیش`;
  }

  return `${fa(Math.floor(days / 30))} ماه پیش`;
}

type Plan = {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  billingInterval: string;
  isPopular: boolean;
  subscriptionCount: number;
};

type ActivityItem = {
  id: string;
  type: "business" | "subscription";
  title: string;
  subject: string;
  at: string;
};

type DashboardStats = {
  businesses: {
    total: number;
    active: number;
    suspended: number;
    deactivated: number;
  };
  subscriptions: {
    total: number;
    active: number;
    expired: number;
    suspended: number;
    cancelled: number;
  };
  users: {
    total: number;
  };
  agents: {
    total: number;
    active: number;
  };
  counts: {
    sites: number;
    customers: number;
    leads: number;
    conversations: number;
    products: number;
    knowledgeItems: number;
  };
  monthlyRevenue: Array<{
    month: string;
    total: number;
  }>;
  popularPlans: Plan[];
  leadTemperatures: {
    hot: number;
    warm: number;
    cold: number;
  };
  activity: ActivityItem[];
  attention: {
    suspendedBusinesses: number;
    expiredSubscriptions: number;
    expiringSoonSubscriptions: number;
  };
};

const PLAN_COLORS = ["#10706B", "#248357", "#B7791F"];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(false);

    api<{ success: boolean; data: DashboardStats }>(
      "/admin/dashboard/stats"
    )
      .then((response) => {
        if (!cancelled) {
          setStats(response.data);
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
          eyebrow="OVERVIEW"
          title="داشبورد"
          description="نمای کلی از وضعیت پلتفرم AGENT-TO"
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
        <div className="mt-5 grid gap-5 xl:grid-cols-[1.65fr_1fr]">
          <div className="panel p-6">
            <div className="h-5 w-40 bg-[#E8ECEB] rounded animate-pulse" />
            <div className="mt-8 flex h-56 items-end gap-2">
              {[38, 52, 45, 63, 58, 71, 67, 82, 74, 88, 79, 94].map(
                (h, i) => (
                  <div
                    key={i}
                    className="h-full flex-1 rounded-t-lg bg-[#E8ECEB] animate-pulse"
                    style={{ height: `${h}%` }}
                  />
                )
              )}
            </div>
          </div>
          <div className="panel p-6">
            <div className="h-5 w-32 bg-[#E8ECEB] rounded animate-pulse" />
            <div className="mt-5 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-[#E8ECEB] rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </Shell>
    );
  }

  if (error || !stats) {
    return (
      <Shell>
        <PageHeader
          eyebrow="OVERVIEW"
          title="داشبورد"
          description="نمای کلی از وضعیت پلتفرم AGENT-TO"
        />
        <div className="panel p-10 text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-[#FDEAEA] text-[#C0392B]">
            <AlertCircle size={28} />
          </div>
          <h3 className="mb-2 text-lg font-black text-[#0B2B29]">
            خطا در بارگذاری داشبورد
          </h3>
          <p className="mb-4 text-sm text-[#7A8785]">
            امکان اتصال به سرور وجود ندارد. لطفاً مجدداً تلاش کنید.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            تلاش مجدد
          </button>
        </div>
      </Shell>
    );
  }

  const maxRevenue = Math.max(
    ...stats.monthlyRevenue.map((item) => item.total),
    1
  );

  const totalSubscriptions = stats.subscriptions.total;

  const attentionItems = [
    `${fa(stats.attention.expiringSoonSubscriptions)} اشتراک در آستانه انقضا`,
    `${fa(stats.attention.suspendedBusinesses)} کسب‌وکار معلق`,
    `${fa(stats.attention.expiredSubscriptions)} اشتراک منقضی`,
  ];

  const leadTemperatureItems = [
    {
      label: "لیدهای داغ",
      value: stats.leadTemperatures.hot,
      color: "#248357",
    },
    {
      label: "لیدهای گرم",
      value: stats.leadTemperatures.warm,
      color: "#B7791F",
    },
    {
      label: "لیدهای سرد",
      value: stats.leadTemperatures.cold,
      color: "#3B82F6",
    },
  ];

  const platformCounts = [
    { label: "سایت‌ها", value: stats.counts.sites },
    { label: "مشتریان", value: stats.counts.customers },
    { label: "لیدها", value: stats.counts.leads },
    { label: "مکالمه‌ها", value: stats.counts.conversations },
    { label: "محصولات", value: stats.counts.products },
    { label: "پایگاه دانش", value: stats.counts.knowledgeItems },
  ];

  return (
    <Shell>
      <PageHeader
        eyebrow="OVERVIEW"
        title="داشبورد"
        description="نمای کلی از وضعیت پلتفرم AGENT-TO"
        action="کسب‌وکار جدید"
      />

      {/* ===== KPI Cards ===== */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="کسب‌وکارهای فعال"
          value={fa(stats.businesses.active)}
          icon={Building2}
          caption={`از ${fa(stats.businesses.total)} کسب‌وکار`}
        />
        <StatCard
          title="اشتراک‌های فعال"
          value={fa(stats.subscriptions.active)}
          icon={CreditCard}
          caption={`از ${fa(stats.subscriptions.total)} اشتراک`}
        />
        <StatCard
          title="کاربران پلتفرم"
          value={fa(stats.users.total)}
          icon={Users}
          caption="کاربران ثبت‌شده"
        />
        <StatCard
          title="AI Agentهای فعال"
          value={fa(stats.agents.active)}
          icon={Bot}
          caption={`از ${fa(stats.agents.total)} Agent`}
        />
      </div>

      {/* ===== Platform counts strip ===== */}
      <div className="mt-4 grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        {platformCounts.map((item) => (
          <div key={item.label} className="panel p-4">
            <div className="text-[11px] font-bold text-[#9AA5A3]">
              {item.label}
            </div>
            <div className="mt-1.5 text-xl font-black text-[#0B2B29]">
              {fa(item.value)}
            </div>
          </div>
        ))}
      </div>

      {/* ===== Lead temperatures strip ===== */}
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {leadTemperatureItems.map((item) => (
          <div
            key={item.label}
            className="panel flex items-center justify-between p-4"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs font-bold text-[#0B2B29]">
                {item.label}
              </span>
            </div>
            <span className="text-lg font-black text-[#0B2B29]">
              {fa(item.value)}
            </span>
          </div>
        ))}
      </div>

      {/* ===== Revenue + Activity ===== */}
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.65fr_1fr]">
        {/* Revenue */}
        <section className="panel relative overflow-hidden p-5 lg:p-6">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-[#10706B]/5 blur-3xl"
          />

          <div className="relative flex items-start justify-between">
            <div>
              <h2 className="text-[15px] font-black text-[#0B2B29]">
                درآمد ماهانه
              </h2>
              <p className="mt-1 text-xs text-[#9AA5A3]">
                روند درآمد ۱۲ ماه اخیر از اشتراک‌ها
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden items-center gap-1 rounded-lg bg-[#EDF8F2] px-2 py-1 text-[11px] font-bold text-[#248357] ring-1 ring-[#C9EBD9] sm:flex">
                <TrendingUp size={12} strokeWidth={2.6} />
                {fa(
                  stats.monthlyRevenue.reduce(
                    (sum, item) => sum + item.total,
                    0
                  )
                )}{" "}
                $ کل
              </span>
              <button
                className="rounded-xl border bg-[#E8F5F3] px-3 py-1.5 text-[11px] font-bold text-[#0B5B57] transition-all hover:border-[#10706B]/30 hover:bg-[#DDEFEA]"
                style={{ borderColor: "var(--line)" }}
              >
                ۱۲ ماه اخیر
              </button>
            </div>
          </div>

          <div className="relative mt-8 flex h-56 items-end gap-2 border-b border-dashed border-[#E6ECEA]">
            {stats.monthlyRevenue.map((item, i) => {
              const isLast =
                i === stats.monthlyRevenue.length - 1;
              const isMax =
                item.total === maxRevenue && maxRevenue > 0;
              const height =
                maxRevenue > 0
                  ? Math.max((item.total / maxRevenue) * 100, 2)
                  : 2;

              return (
                <div
                  key={`${item.month}-${i}`}
                  className="group flex h-full flex-1 items-end"
                >
                  <div
                    style={{ height: `${height}%` }}
                    className={[
                      "relative w-full rounded-t-lg transition-all duration-300",
                      "bg-gradient-to-t from-[#0B5B57] to-[#10706B]",
                      isLast || isMax
                        ? "opacity-100 shadow-[0_8px_24px_-8px_rgba(16,112,107,0.6)]"
                        : "opacity-70 group-hover:opacity-100",
                    ].join(" ")}
                  >
                    <span className="pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-[#071F1E] px-1.5 py-0.5 text-[9px] font-bold text-white group-hover:block">
                      ${fa(item.total)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex justify-between text-[10px] font-medium text-[#9AA5A3]">
            {stats.monthlyRevenue.map((item, i) => (
              <span key={`${item.month}-${i}`}>{item.month}</span>
            ))}
          </div>
        </section>

        {/* Activity */}
        <section className="panel flex flex-col p-5 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-black text-[#0B2B29]">
                فعالیت اخیر
              </h2>
              <p className="mt-1 text-xs text-[#9AA5A3]">
                آخرین اتفاقات پلتفرم
              </p>
            </div>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#E8F5F3] text-[#10706B] shadow-[inset_0_0_0_1px_rgba(16,112,107,0.08)]">
              <Activity size={18} strokeWidth={2.2} />
            </span>
          </div>

          <div className="mt-5 space-y-1">
            {stats.activity.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#9AA5A3]">
                فعالیتی وجود ندارد
              </div>
            ) : (
              stats.activity.map((item) => (
                <div
                  key={item.id}
                  className="group flex gap-3 rounded-xl p-3 transition-colors hover:bg-[#F7F9F8]"
                >
                  <div className="relative mt-1.5 flex h-2 w-2 shrink-0">
                    <span
                      className={[
                        "absolute inline-flex h-full w-full animate-ping rounded-full opacity-60",
                        item.type === "business"
                          ? "bg-[#248357]"
                          : "bg-[#10706B]",
                      ].join(" ")}
                    />
                    <span
                      className={[
                        "relative inline-flex h-2 w-2 rounded-full",
                        item.type === "business"
                          ? "bg-[#248357]"
                          : "bg-[#10706B]",
                      ].join(" ")}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-[#0B2B29]">
                      {item.title}
                    </div>
                    <div className="mt-1 text-[10px] font-medium text-[#9AA5A3]">
                      {item.subject} · {faRelativeTime(item.at)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            className="group mt-3 flex w-full items-center justify-center gap-2 border-t pt-4 text-xs font-bold text-[#10706B] transition-colors hover:text-[#0B5B57]"
            style={{ borderColor: "var(--line)" }}
          >
            مشاهده همه فعالیت‌ها
            <ArrowLeft
              size={14}
              strokeWidth={2.6}
              className="transition-transform duration-200 group-hover:-translate-x-1"
            />
          </button>
        </section>
      </div>

      {/* ===== Bottom Grid ===== */}
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        {/* AI Health */}
        <section className="panel relative overflow-hidden p-5">
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-[#10706B]/10 blur-3xl"
          />

          <div className="relative flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#E8F5F3] text-[#10706B] shadow-[inset_0_0_0_1px_rgba(16,112,107,0.08)]">
              <Sparkles size={16} strokeWidth={2.2} />
            </span>
            <h2 className="text-[15px] font-black text-[#0B2B29]">
              AI Platform Health
            </h2>
          </div>

          <div className="relative mt-5 flex items-center gap-4">
            <div className="relative grid h-24 w-24 place-items-center">
              <svg
                viewBox="0 0 100 100"
                className="absolute inset-0 h-full w-full -rotate-90"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#DDEFEA"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#10706B"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - 0.98)}`}
                  className="transition-all duration-700"
                />
              </svg>
              <span className="text-lg font-black text-[#0B2B29]">98%</span>
            </div>
            <div>
              <div className="text-sm font-black text-[#0B2B29]">
                عملکرد عالی
              </div>
              <div className="mt-1 text-xs text-[#9AA5A3]">
                تمام سرویس‌های اصلی فعال هستند.
              </div>
              <div className="mt-2 inline-flex items-center gap-1 rounded-lg bg-[#EDF8F2] px-2 py-1 text-[10px] font-bold text-[#248357] ring-1 ring-[#C9EBD9]">
                <CircleDot size={10} strokeWidth={2.6} />
                All systems operational
              </div>
            </div>
          </div>
        </section>

        {/* Popular Plans */}
        <section className="panel p-5">
          <h2 className="text-[15px] font-black text-[#0B2B29]">
            پلن‌های محبوب
          </h2>

          <div className="mt-4 space-y-3">
            {stats.popularPlans.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#9AA5A3]">
                هیچ پلنی یافت نشد
              </div>
            ) : (
              stats.popularPlans.map((plan, i) => {
                const pct =
                  totalSubscriptions > 0
                    ? Math.round(
                        (plan.subscriptionCount /
                          totalSubscriptions) *
                          100
                      )
                    : 0;

                return (
                  <div key={plan.id}>
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="font-bold text-[#0B2B29]">
                        {plan.name}
                      </span>
                      <span className="font-medium text-[#9AA5A3]">
                        {fa(plan.subscriptionCount)} اشتراک
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#EEF2F1]">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          background:
                            PLAN_COLORS[
                              i % PLAN_COLORS.length
                            ],
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Needs Attention */}
        <section className="panel p-5">
          <h2 className="text-[15px] font-black text-[#0B2B29]">
            نیازمند توجه
          </h2>

          <div className="mt-4 space-y-2">
            {attentionItems.map((item, i) => (
              <div
                key={item}
                className="group flex items-center justify-between rounded-xl bg-[#FAFBFB] p-3 ring-1 ring-[#EEF1F0] transition-all hover:bg-[#F2F6F5] hover:ring-[#DDEFEA]"
              >
                <span className="text-xs font-bold text-[#0B2B29]">
                  {item}
                </span>
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#FFF4E5] text-xs font-black text-[#B7791F] ring-1 ring-[#F5E2C0]">
                  {fa(i + 1)}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Shell>
  );
}
