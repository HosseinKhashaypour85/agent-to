"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  ReceiptText,
  Users,
  Bot,
  Radio,
  BarChart3,
  LifeBuoy,
  Bell,
  FileClock,
  Settings,
  Search,
  ChevronDown,
  Menu,
  X,
  Sparkles,
} from "lucide-react";

/* ============ Nav groups ============ */
const groups = [
  {
    label: "MAIN",
    items: [
      ["داشبورد", "/dashboard", LayoutDashboard],
      ["کسب‌وکارها", "/businesses", Building2],
      ["کاربران", "/users", Users],
    ],
  },
  {
    label: "BILLING",
    items: [
      ["پلن‌ها", "/plans", CreditCard],
      ["اشتراک‌ها", "/subscriptions", ReceiptText],
      ["پرداخت‌ها", "/payments", ReceiptText],
    ],
  },
  {
    label: "OPERATIONS",
    items: [
      ["AI Agents", "/agents", Bot],
      ["کانال‌ها", "/channels", Radio],
      ["مصرف و Usage", "/usage", BarChart3],
      ["پشتیبانی", "/support", LifeBuoy],
    ],
  },
  {
    label: "SYSTEM",
    items: [
      ["اعلان‌ها", "/notifications", Bell],
      ["Audit Logs", "/audit-logs", FileClock],
      ["تنظیمات", "/settings", Settings],
    ],
  },
] as const;

export default function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F9F8]">
      {/* ==================== Sidebar ==================== */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-[280px] flex-col border-l bg-white transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
        style={{ borderColor: "var(--line)" }}
      >
        {/* ===== Brand ===== */}
        <div
          className="relative flex items-center justify-between border-b px-5 py-4"
          style={{ borderColor: "var(--line)" }}
        >
          <div className="flex items-center gap-3">
            <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#0B5B57] via-[#10706B] to-[#071F1E] text-white shadow-[0_6px_18px_-6px_rgba(16,112,107,0.7)]">
              <Sparkles size={17} />
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-[#4ADE80] ring-2 ring-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[15px] font-black tracking-tight text-[#0B2B29]">
                  AGENT-TO
                </span>
                <span className="rounded-md bg-[#10706B]/10 px-1.5 py-0.5 text-[9px] font-black tracking-wider text-[#10706B]">
                  v2
                </span>
              </div>
              <div className="mt-0.5 text-[10px] font-semibold tracking-wider text-[#9AA5A3]">
                Super Admin Panel
              </div>
            </div>
          </div>

          <button
            className="grid h-8 w-8 place-items-center rounded-lg text-[#9AA5A3] transition-all hover:bg-[#F2F6F5] hover:text-[#0B5B57] lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="بستن منو"
          >
            <X size={16} />
          </button>
        </div>

        {/* ===== Navigation (scrollable) ===== */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {groups.map((group, gi) => (
            <div key={group.label} className={gi !== 0 ? "mt-5" : ""}>
              <div className="mb-2 flex items-center gap-2 px-3">
                <span className="text-[9px] font-black tracking-[.2em] text-[#9AA5A3]">
                  {group.label}
                </span>
                <span className="h-px flex-1 bg-gradient-to-l from-[#EEF1F0] to-transparent" />
              </div>

              <div className="space-y-0.5">
                {group.items.map(([label, href, Icon]) => {
                  const active =
                    path === href ||
                    (href !== "/dashboard" && path.startsWith(href));

                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpen(false)}
                      className={`group relative flex items-center gap-3 rounded-xl px-2.5 py-2 text-[13px] font-semibold transition-all duration-200 ${
                        active
                          ? "bg-gradient-to-l from-[#E8F5F3] to-[#F2F9F8] text-[#0B5B57] shadow-[inset_0_0_0_1px_rgba(16,112,107,0.08)]"
                          : "text-[#5A6765] hover:bg-[#F7F9F8] hover:text-[#0B2B29]"
                      }`}
                    >
                      {active && (
                        <span className="absolute -right-[13px] top-1/2 h-5 w-1 -translate-y-1/2 rounded-l-full bg-[#10706B]" />
                      )}

                      <span
                        className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-all duration-200 ${
                          active
                            ? "bg-white text-[#10706B] shadow-[0_2px_6px_-2px_rgba(16,112,107,0.35)]"
                            : "bg-[#F2F6F5] text-[#7A8785] group-hover:bg-white group-hover:text-[#10706B] group-hover:shadow-[0_2px_6px_-2px_rgba(16,112,107,0.25)]"
                        }`}
                      >
                        <Icon
                          size={16}
                          strokeWidth={active ? 2.4 : 2}
                          className="transition-transform duration-200 group-hover:scale-110"
                        />
                      </span>

                      <span className="flex-1 truncate">{label}</span>

                      {active && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#10706B]" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* ===== User Card ===== */}
        <div className="border-t p-3" style={{ borderColor: "var(--line)" }}>
          <button className="group flex w-full items-center gap-3 rounded-xl border border-[#EEF1F0] bg-gradient-to-br from-white to-[#F7FBFA] p-2.5 text-right transition-all hover:border-[#10706B]/20 hover:shadow-[0_4px_14px_-8px_rgba(16,112,107,0.5)]">
            <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#0B5B57] to-[#071F1E] text-xs font-black text-white">
              HK
              <span className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full bg-[#4ADE80] ring-2 ring-white" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-black text-[#0B2B29]">
                Super Admin
              </span>
              <span className="block truncate text-[10px] font-medium text-[#9AA5A3]">
                مدیریت پلتفرم
              </span>
            </span>
            <ChevronDown
              size={14}
              className="text-[#9AA5A3] transition-transform duration-200 group-hover:translate-y-0.5"
            />
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ==================== Main ==================== */}
      <div className="lg:mr-[280px]">
        {/* ==================== Header ==================== */}
        <header className="sticky top-0 z-40 border-b border-transparent bg-white/70 backdrop-blur-2xl">
          {/* Soft glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-16 left-1/2 h-32 w-[60%] -translate-x-1/2 rounded-full bg-[#10706B]/5 blur-3xl"
          />

          <div className="relative flex h-[72px] items-center gap-3 px-5 lg:px-8">
            <button
              className="grid h-10 w-10 place-items-center rounded-xl border border-transparent text-[#4A5755] transition-all hover:border-[var(--line)] hover:bg-white hover:text-[#0B5B57] lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="باز کردن منو"
            >
              <Menu size={18} />
            </button>

            {/* Search */}
            <div className="group relative hidden max-w-lg flex-1 md:block">
              <Search
                size={17}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9AA5A3] transition-colors group-focus-within:text-[#10706B]"
              />
              <input
                className="h-11 w-full rounded-2xl border bg-white/80 pr-11 pl-16 text-[13px] font-medium outline-none transition-all placeholder:text-[#9AA5A3] hover:bg-white focus:border-[#10706B] focus:bg-white focus:shadow-[0_0_0_4px_rgba(16,112,107,0.10)]"
                style={{ borderColor: "var(--line)" }}
                placeholder="جستجو در پنل..."
              />
              <kbd
                className="pointer-events-none absolute left-3 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded-lg border bg-[#F7F9F8] px-1.5 py-0.5 text-[10px] font-bold text-[#7A8785] lg:inline-flex"
                style={{ borderColor: "var(--line)" }}
              >
                ⌘ K
              </kbd>
            </div>

            {/* Right cluster */}
            <div className="mr-auto flex items-center gap-2">
              <div
                className="hidden items-center gap-1.5 rounded-full border bg-white/80 px-3 py-1.5 text-[11px] font-bold text-[#248357] shadow-sm xl:flex"
                style={{ borderColor: "var(--line)" }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4ADE80] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22C55E]" />
                </span>
                All systems operational
              </div>

              <div className="mx-1 hidden h-6 w-px bg-[var(--line)] xl:block" />

              <button
                className="group relative grid h-10 w-10 place-items-center rounded-xl border bg-white/80 text-[#4A5755] transition-all hover:-translate-y-0.5 hover:border-[#10706B]/30 hover:bg-white hover:text-[#0B5B57] hover:shadow-[0_8px_20px_-10px_rgba(16,112,107,0.5)]"
                style={{ borderColor: "var(--line)" }}
                aria-label="اعلان‌ها"
              >
                <Bell
                  size={18}
                  className="transition-transform group-hover:-rotate-12"
                />
                <span className="absolute right-2 top-2 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#10706B] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#10706B] ring-2 ring-white" />
                </span>
              </button>

              <button
                className="group flex items-center gap-2.5 rounded-2xl border bg-white/80 py-1.5 pr-1.5 pl-2.5 transition-all hover:-translate-y-0.5 hover:border-[#10706B]/30 hover:bg-white hover:shadow-[0_8px_20px_-10px_rgba(16,112,107,0.5)]"
                style={{ borderColor: "var(--line)" }}
              >
                <span className="relative grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-[#0B5B57] to-[#071F1E] text-xs font-black text-white shadow-[0_4px_12px_-4px_rgba(7,31,30,0.6)]">
                  ح
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#4ADE80] ring-2 ring-white" />
                </span>
                <span className="hidden text-right sm:block">
                  <span className="block text-xs font-black leading-tight text-[#0B2B29]">
                    حسین
                  </span>
                  <span className="block text-[10px] font-semibold leading-tight text-[#7A8785]">
                    Super Admin
                  </span>
                </span>
                <ChevronDown
                  size={14}
                  className="text-[#7A8785] transition-transform duration-200 group-hover:translate-y-0.5"
                />
              </button>
            </div>
          </div>
        </header>

        {/* ==================== Page content ==================== */}
        <main className="min-h-[calc(100vh-72px)] p-5 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}