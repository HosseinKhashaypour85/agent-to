"use client";

import { useState } from "react";
import Shell from "@/components/Shell";
import PageHeader from "@/components/PageHeader";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
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
  Sun,
  Moon,
  Monitor,
  Languages,
  Palette,
  Check,
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
  {
    key: "appearance",
    title: "نمایش و زبان",
    description: "تم رنگی، زبان رابط کاربری و تنظیمات ظاهری",
    icon: Palette,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    badge: "جدید",
    items: ["حالت روشن/تیره", "انتخاب زبان", "جهت متن"],
  },
];

export default function Settings() {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const themeOptions = [
    { value: "light" as const, label: t("theme.light"), icon: Sun, desc: " همیشه روشن" },
    { value: "dark" as const, label: t("theme.dark"), icon: Moon, desc: " همیشه تیره" },
    { value: "system" as const, label: t("theme.system"), icon: Monitor, desc: "ตาม تنظیمات سیستم" },
  ];

  const languageOptions = [
    { value: "fa" as const, label: t("language.fa"), nativeLabel: "فارسی", dir: "rtl" },
    { value: "en" as const, label: t("language.en"), nativeLabel: "English", dir: "ltr" },
    { value: "ar" as const, label: t("language.ar"), nativeLabel: "العربية", dir: "rtl" },
  ];

  const renderAppearanceSection = () => (
    <div className="space-y-6">
      {/* Theme Selector */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
            <Palette size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">{t("theme.title")}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t("theme.description")}</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const isActive = theme === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setTheme(option.value)}
                className={`relative group flex flex-col items-center gap-3 rounded-xl p-5 transition-all duration-200 border-2 ${
                  isActive
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 ring-1 ring-emerald-500/20"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-lg"
                }`}
              >
                {isActive && (
                  <div className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <Icon size={10} />
                  </div>
                )}
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 group-hover:scale-110 transition-transform">
                  <Icon size={22} />
                </div>
                <div className="text-center">
                  <span className="font-bold text-slate-900 dark:text-slate-100">{option.label}</span>
                  <span className="block mt-0.5 text-xs text-slate-500 dark:text-slate-400">{option.desc}</span>
                </div>
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <span className={`h-3 w-3 rounded-full ${resolvedTheme === "dark" ? "bg-slate-800" : "bg-slate-200"}`} />
            {t("theme." + (resolvedTheme === "dark" ? "dark" : "light"))} {t("theme.description").includes("سیستم") ? "(" + t("theme.system") + ")" : ""}
          </span>
        </div>
      </section>

      {/* Language Selector */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
            <Languages size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">{t("language.title")}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t("language.description")}</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {languageOptions.map((option) => {
            const isActive = language === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setLanguage(option.value)}
                className={`relative group flex flex-col items-center gap-3 rounded-xl p-5 transition-all duration-200 border-2 ${
                  isActive
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 ring-1 ring-emerald-500/20"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-lg"
                }`}
                dir={option.dir}
              >
                {isActive && (
                  <div className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <Check size={10} />
                  </div>
                )}
                <div className="text-center">
                  <span className="text-3xl font-bold">{option.nativeLabel}</span>
                  <span className="block mt-1 text-sm text-slate-500 dark:text-slate-400">{option.label}</span>
                  <span className="block mt-0.5 text-xs text-slate-400 dark:text-slate-500 capitalize">{option.dir === "rtl" ? "چپ به راست" : "راست به چپ"}</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );

  if (activeKey === "appearance") {
    return (
      <Shell>
        <PageHeader
          title={t("settings.appearance")}
          description={t("theme.description") + " • " + t("language.description")}
          action={
            <button
              onClick={() => setActiveKey(null)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft size={16} />
              بازگشت
            </button>
          }
        />
        {renderAppearanceSection()}
      </Shell>
    );
  }

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