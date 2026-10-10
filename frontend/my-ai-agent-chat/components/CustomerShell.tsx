"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { api, clearCustomerSession } from "@/lib/api";
import { LayoutDashboard, Bot, Radio, Package, Database, Sparkles, MessagesSquare, Users, UserRoundSearch, CreditCard, LifeBuoy, Settings, Palette, Bell, Menu, X, Search, ChevronLeft, Zap, LogOut, LoaderCircle, Send } from "lucide-react";

const nav = [
  { title: "نمای کلی", items: [
    { label: "داشبورد", href: "/customer-dashboard", icon: LayoutDashboard },
    { label: "ایجنت‌های هوشمند", href: "/customer-agents", icon: Bot },
    { label: "کانال‌ها", href: "/customer-channels", icon: Radio },
    { label: "ظاهر صفحه چت", href: "/customer-chat-settings", icon: Palette },
    { label: "ربات تلگرام", href: "/customer-telegram", icon: Send },
  ]},
  { title: "هوش محصول", items: [
    { label: "منابع محصولات", href: "/product-sources", icon: Database },
    { label: "کاتالوگ محصولات", href: "/product-catalog", icon: Package },
    { label: "تحلیل هوشمند", href: "/product-analysis", icon: Sparkles },
  ]},
  { title: "ارتباط با مشتری", items: [
    { label: "مکالمات", href: "/customer-conversations", icon: MessagesSquare },
    { label: "مشتریان", href: "/customer-customers", icon: Users },
    { label: "سرنخ‌های فروش", href: "/customer-leads", icon: UserRoundSearch },
  ]},
  { title: "حساب کاربری", items: [
    { label: "مصرف هوش مصنوعی", href: "/customer-usage", icon: Zap },
    { label: "اشتراک و پرداخت", href: "/customer-subscription", icon: CreditCard },
    { label: "تیکت‌های پشتیبانی", href: "/customer-support", icon: LifeBuoy },
    { label: "تنظیمات", href: "/customer-settings", icon: Settings },
  ]},
];

export default function CustomerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [usage, setUsage] = useState<number | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const loadHeader = useCallback(async () => {
    try {
      const result = await api<any>("/auth/me");
      if (result?.data) {
        setUser(result.data);
        window.sessionStorage.setItem("agentto_user", JSON.stringify(result.data));
      }
    } catch {
      try {
        const cached = window.sessionStorage.getItem("agentto_user");
        if (cached) setUser(JSON.parse(cached));
      } catch { /* Ignore invalid cached profile. */ }
    }
    try {
      const result = await api<any>("/usage/me");
      if (result?.success && result.data?.summary) {
        const total = Number(result.data.summary.aiMessages || 0);
        setUsage(total);
      }
    } catch { setUsage(null); }
  }, []);

  useEffect(() => { void loadHeader(); }, [loadHeader]);

  async function logout() {
    setLoggingOut(true);
    clearCustomerSession();
    router.replace("/customer-login");
  }

  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.name || user?.email || "حساب مشتری";
  const initial = displayName.trim().charAt(0) || "م";

  return <div dir="rtl" className="min-h-screen bg-[#F6F8F7] text-[#173331]">
    {mobileOpen && <button aria-label="بستن منو" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-40 bg-[#092F2C]/35 lg:hidden" />}
    <aside className={`fixed inset-y-0 right-0 z-50 flex w-[264px] flex-col border-l border-[#E3EAE8] bg-white transition-transform lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "translate-x-full"}`}>
      <div className="flex h-[76px] items-center justify-between border-b border-[#E9EFED] px-5"><Link href="/customer-dashboard" className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-[14px] bg-[#10706B] text-white"><Sparkles size={21}/></span><span><b className="block text-[17px] tracking-tight">AGENT-TO</b><small className="text-[11px] text-[#81908E]">فضای کسب‌وکار شما</small></span></Link><button className="lg:hidden" onClick={() => setMobileOpen(false)} aria-label="بستن"><X size={19}/></button></div>
      <div className="border-b border-[#E9EFED] px-4 py-4"><div className="flex w-full items-center gap-3 rounded-xl border border-[#E6ECEA] bg-[#FAFCFB] p-3 text-right"><span className="grid h-9 w-9 place-items-center rounded-lg bg-[#DFF1ED] text-sm font-bold text-[#10706B]">{initial}</span><span className="min-w-0 flex-1"><b className="block truncate text-sm">{displayName}</b><small className="block truncate text-xs text-[#81908E]">{user?.email || "حساب مشتری"}</small></span></div></div>
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-5">{nav.map(group => <section key={group.title}><p className="mb-2 px-3 text-[10px] font-bold tracking-[.12em] text-[#9AA6A3]">{group.title}</p><div className="space-y-1">{group.items.map(item => {const active = pathname === item.href; const Icon = item.icon; return <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition ${active ? "bg-[#E8F4F1] text-[#0B6C65]" : "text-[#61716E] hover:bg-[#F5F8F7] hover:text-[#173331]"}`}><Icon size={18} strokeWidth={active ? 2.2 : 1.8}/><span>{item.label}</span>{active && <span className="mr-auto h-1.5 w-1.5 rounded-full bg-[#10706B]"/>}</Link>})}</div></section>)}</nav>
      <div className="m-4 rounded-2xl bg-[#F0F8F6] p-4"><div className="mb-2 flex items-center gap-2 text-sm font-bold"><Zap size={16} className="text-[#10706B]"/>مصرف ثبت‌شده</div><div className="mb-2 flex items-center justify-between text-xs"><span className="text-[#72817E]">پاسخ‌های AI</span><b>{usage === null ? "—" : new Intl.NumberFormat("fa-IR").format(usage)}</b></div><Link href="/customer-usage" className="mt-3 block text-xs font-bold text-[#10706B]">مشاهده جزئیات ←</Link></div>
    </aside>
    <div className="min-h-screen lg:mr-[264px]"><header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-[#E4EBE8] bg-white/90 px-4 backdrop-blur-xl sm:px-7"><div className="flex items-center gap-3"><button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 hover:bg-[#F2F6F5] lg:hidden" aria-label="باز کردن منو"><Menu size={21}/></button><div className="hidden items-center gap-2 rounded-xl border border-[#E6ECEA] bg-[#FAFCFB] px-3 py-2 text-sm text-[#899794] sm:flex"><Search size={16}/><span>پنل کسب‌وکار</span></div></div><div className="flex items-center gap-3"><button aria-label="اعلان‌ها" className="rounded-xl border border-[#E6ECEA] p-2.5 text-[#61716E] hover:bg-[#F7FAF9]"><Bell size={18}/></button><div className="h-8 w-px bg-[#E6ECEA]"/><div className="hidden text-right sm:block"><b className="block text-xs">{displayName}</b><small className="text-[10px] text-[#81908E]">حساب مشتری</small></div><button onClick={() => void logout()} disabled={loggingOut} aria-label="خروج از حساب" className="rounded-xl border border-[#E6ECEA] p-2.5 text-[#61716E] hover:bg-[#FFF3F2] hover:text-red-600">{loggingOut ? <LoaderCircle size={17} className="animate-spin"/> : <LogOut size={17}/>}</button></div></header><main className="mx-auto w-full max-w-[1500px] p-4 sm:p-7 lg:p-9">{children}</main></div>
  </div>;
}
