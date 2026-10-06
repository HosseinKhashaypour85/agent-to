import Shell from "@/components/Shell";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
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
} from "lucide-react";

const bars = [38, 52, 45, 63, 58, 71, 67, 82, 74, 88, 79, 94];

const months = [
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
];

const activities: Array<[string, string, string, "success" | "info"]> = [
  ["کسب‌وکار جدید ایجاد شد", "فروشگاه تست", "۲ دقیقه پیش", "success"],
  ["اشتراک Pro فعال شد", "Digikala Demo", "۱۸ دقیقه پیش", "info"],
  ["AI Agent جدید فعال شد", "Nova Store", "۴۲ دقیقه پیش", "success"],
  ["پرداخت موفق", "Tech Market", "۱ ساعت پیش", "success"],
  ["کاربر جدید اضافه شد", "ABC Shop", "۲ ساعت پیش", "info"],
];

export default function Dashboard() {
  const max = Math.max(...bars);

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
          value="128"
          change="+12.8%"
          icon={Building2}
          caption="در ۳۰ روز گذشته"
        />
        <StatCard
          title="اشتراک‌های فعال"
          value="96"
          change="+8.4%"
          icon={CreditCard}
          caption="از ۱۲۸ کسب‌وکار"
        />
        <StatCard
          title="کاربران پلتفرم"
          value="1,842"
          change="+14.2%"
          icon={Users}
          caption="کاربران ثبت‌شده"
        />
        <StatCard
          title="AI Agentهای فعال"
          value="214"
          change="+21.7%"
          icon={Bot}
          caption="در تمام کسب‌وکارها"
        />
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
                روند درآمد ۱۲ ماه اخیر
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden items-center gap-1 rounded-lg bg-[#EDF8F2] px-2 py-1 text-[11px] font-bold text-[#248357] ring-1 ring-[#C9EBD9] sm:flex">
                <TrendingUp size={12} strokeWidth={2.6} />
                +۲۴.۶٪ رشد
              </span>
              <button
                className="rounded-xl border bg-white px-3 py-1.5 text-[11px] font-bold text-[#0B5B57] transition-all hover:border-[#10706B]/30 hover:bg-[#F2F9F8]"
                style={{ borderColor: "var(--line)" }}
              >
                ۱۲ ماه اخیر
              </button>
            </div>
          </div>

          <div className="relative mt-8 flex h-56 items-end gap-2 border-b border-dashed border-[#E6ECEA]">
            {bars.map((h, i) => {
              const isLast = i === bars.length - 1;
              const isMax = h === max;
              return (
                <div key={i} className="group flex h-full flex-1 items-end">
                  <div
                    style={{ height: `${h}%` }}
                    className={[
                      "relative w-full rounded-t-lg transition-all duration-300",
                      "bg-gradient-to-t from-[#0B5B57] to-[#10706B]",
                      isLast || isMax
                        ? "opacity-100 shadow-[0_8px_24px_-8px_rgba(16,112,107,0.6)]"
                        : "opacity-70 group-hover:opacity-100",
                    ].join(" ")}
                  >
                    <span className="pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-[#071F1E] px-1.5 py-0.5 text-[9px] font-bold text-white group-hover:block">
                      ${h * 31}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex justify-between text-[10px] font-medium text-[#9AA5A3]">
            {months.map((x) => (
              <span key={x}>{x}</span>
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
            {activities.map(([title, sub, time, tone], i) => (
              <div
                key={i}
                className="group flex gap-3 rounded-xl p-3 transition-colors hover:bg-[#F7F9F8]"
              >
                <div className="relative mt-1.5 flex h-2 w-2 shrink-0">
                  <span
                    className={[
                      "absolute inline-flex h-full w-full animate-ping rounded-full opacity-60",
                      tone === "success" ? "bg-[#248357]" : "bg-[#10706B]",
                    ].join(" ")}
                  />
                  <span
                    className={[
                      "relative inline-flex h-2 w-2 rounded-full",
                      tone === "success" ? "bg-[#248357]" : "bg-[#10706B]",
                    ].join(" ")}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-[#0B2B29]">
                    {title}
                  </div>
                  <div className="mt-1 text-[10px] font-medium text-[#9AA5A3]">
                    {sub} · {time}
                  </div>
                </div>
              </div>
            ))}
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
            {[
              ["Pro", "62%", "79 کسب‌وکار", "#10706B"],
              ["Business", "24%", "31 کسب‌وکار", "#248357"],
              ["Starter", "14%", "18 کسب‌وکار", "#B7791F"],
            ].map(([name, pct, count, color]) => (
              <div key={name}>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="font-bold text-[#0B2B29]">{name}</span>
                  <span className="font-medium text-[#9AA5A3]">{count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#EEF2F1]">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: pct, background: color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Needs Attention */}
        <section className="panel p-5">
          <h2 className="text-[15px] font-black text-[#0B2B29]">
            نیازمند توجه
          </h2>

          <div className="mt-4 space-y-2">
            {[
              "۳ اشتراک در آستانه انقضا",
              "۲ پرداخت ناموفق",
              "۵ تیکت بدون پاسخ",
            ].map((x, i) => (
              <div
                key={x}
                className="group flex items-center justify-between rounded-xl bg-[#FAFBFB] p-3 ring-1 ring-[#EEF1F0] transition-all hover:bg-[#F2F6F5] hover:ring-[#DDEFEA]"
              >
                <span className="text-xs font-bold text-[#0B2B29]">{x}</span>
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#FFF4E5] text-xs font-black text-[#B7791F] ring-1 ring-[#F5E2C0]">
                  {i + 1}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Shell>
  );
}