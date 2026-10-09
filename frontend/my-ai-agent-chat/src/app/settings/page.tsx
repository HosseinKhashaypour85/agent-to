"use client";

import { useState } from "react";
import Shell from "@/components/Shell";
import PageHeader from "@/components/PageHeader";
import {
  Settings as SettingsIcon,
  ShieldCheck,
  Mail,
  Bot,
  CreditCard,
  Code2,
  ChevronLeft,
  Globe,
  Bell,
  Lock,
  Zap,
  Webhook,
  Database,
} from "lucide-react";

type Section = {
  key: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconBg: string;
  iconColor: string;
  badge?: string;
  items: string[];
};

const sections: Section[] = [
  {
    key: "general",
    title: "عمومی",
    description: "تنظیمات پایه‌ی پلتفرم، زبان، منطقه‌ی زمانی و اطلاعات برند",
    icon: Globe,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    items: ["زبان پیش‌فرض", "منطقه‌ی زمانی", "لوگو و برندینگ"],
  },
  {
    key: "security",
    title: "امنیت",
    description: "مدیریت رمز عبور، احراز هویت دو مرحله‌ای و نشست‌های فعال",
    icon: ShieldCheck,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    badge: "مهم",
    items: ["احراز هویت دو مرحله‌ای", "لیست نشست‌ها", "سیاست رمز عبور"],
  },
  {
    key: "notifications",
    title: "ایمیل و اعلان‌ها",
    description: "پیکربندی SMTP، قالب ایمیل‌ها و اعلان‌های سیستمی",
    icon: Mail,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    items: ["SMTP", "قالب ایمیل", "اعلان‌های سیستمی"],
  },
  {
    key: "ai",
    title: "AI Engine",
    description: "تنظیمات موتور هوش مصنوعی، مدل پیش‌فرض و کلیدهای API",
    icon: Bot,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    badge: "جدید",
    items: ["مدل پیش‌فرض", "کلیدهای API", "محدودیت مصرف"],
  },
  {
    key: "billing",
    title: "پرداخت و صورت‌حساب",
    description: "درگاه پرداخت، مالیات و تنظیمات صورت‌حساب‌ها",
    icon: CreditCard,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    items: ["درگاه پرداخت", "مالیات", "صورت‌حساب"],
  },
  {
    key: "api",
    title: "API",
    description: "کلیدهای API، Webhookها و مستندات توسعه‌دهندگان",
    icon: Code2,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    items: ["کلیدهای API", "Webhook", "مستندات"],
  },
];

export default function Settings() {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  return (
    <Shell>
      <PageHeader
        title="تنظیمات"
        description="تنظیمات مرکزی پلتفرم AGENT-TO"
      />

      {/* هدر کوچک معرفی */}
      <div className="mb-6 flex items-start gap-4 rounded-2xl border border-emerald-100 bg-gradient-to-l from-emerald-50/70 to-white p-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
          <SettingsIcon size={22} />
        </div>
        <div>
          <h2 className="text-base font-black text-slate-800">
            مرکز کنترل پلتفرم
          </h2>
          <p className="mt-1 text-sm text-slate-500 leading-relaxed">
            از این بخش می‌توانید تنظیمات عمومی، امنیتی، پرداخت و API پلتفرم را
            مدیریت کنید. برای شروع، یکی از بخش‌های زیر را انتخاب کنید.
          </p>
        </div>
      </div>

      {/* گرید کارت‌ها */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeKey === section.key;

          return (
            <button
              type="button"
              key={section.key}
              onClick={() => setActiveKey(section.key)}
              className={`group relative overflow-hidden rounded-2xl border bg-white p-6 text-right transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                isActive
                  ? "border-emerald-500 shadow-md ring-1 ring-emerald-500/20"
                  : "border-slate-200 shadow-sm hover:border-emerald-300 hover:shadow-emerald-100/60"
              }`}
            >
              {/* نوار سبز بالای کارت هنگام فعال بودن */}
              {isActive && (
                <div className="absolute inset-x-0 top-0 h-1 bg-emerald-500" />
              )}

              {/* دایره تزئینی پس‌زمینه */}
              <div className="pointer-events-none absolute -left-12 -top-12 h-32 w-32 rounded-full bg-emerald-50 opacity-0 transition-opacity group-hover:opacity-100" />

              <div className="relative">
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${section.iconBg} ${section.iconColor}`}
                  >
                    <Icon size={20} />
                  </div>

                  {section.badge && (
                    <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-black text-white">
                      {section.badge}
                    </span>
                  )}
                </div>

                <h3 className="mt-4 flex items-center gap-2 text-base font-black text-slate-800">
                  {section.title}
                </h3>

                <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                  {section.description}
                </p>

                {/* لیست آیتم‌ها */}
                <ul className="mt-4 space-y-1.5">
                  {section.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-xs text-slate-500"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {item}
                    </li>
                  ))}
                </ul>

                {/* دکمه ورود */}
                <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-emerald-600 transition-all group-hover:gap-2.5">
                  ورود به تنظیمات
                  <ChevronLeft size={14} />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* راهنمای پایین صفحه */}
      <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-emerald-600" />
          تغییرات به‌صورت خودکار ذخیره می‌شوند
        </div>
        <span className="hidden h-4 w-px bg-slate-200 sm:block" />
        <div className="flex items-center gap-2">
          <Database size={14} className="text-emerald-600" />
          پشتیبان‌گیری روزانه فعال است
        </div>
        <span className="hidden h-4 w-px bg-slate-200 sm:block" />
        <div className="flex items-center gap-2">
          <Webhook size={14} className="text-emerald-600" />
          نسخه‌ی API: v1.2
        </div>
      </div>
    </Shell>
  );
}