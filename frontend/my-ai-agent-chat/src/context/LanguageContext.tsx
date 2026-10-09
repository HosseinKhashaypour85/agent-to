"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Language = "fa" | "en" | "ar";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  fa: {
    // General
    "app.name": "AGENT-TO",
    "app.tagline": "پنل مدیریت هوشمند",
    "settings.title": "تنظیمات",
    "settings.description": "تنظیمات مرکزی پلتفرم AGENT-TO",
    "save": "ذخیره",
    "cancel": "انصراف",
    "loading": "در حال بارگذاری...",
    "error": "خطا",
    "retry": "تلاش مجدد",
    
    // Theme
    "theme.title": "حالت نمایش",
    "theme.description": "انتخاب تم رنگی برای رابط کاربری",
    "theme.light": "روشن",
    "theme.dark": "تیره",
    "theme.system": "سیستمی",
    
    // Language
    "language.title": "زبان",
    "language.description": "انتخاب زبان رابط کاربری",
    "language.fa": "فارسی",
    "language.en": "English",
    "language.ar": "العربية",
    
    // Navigation
    "nav.dashboard": "داشبورد",
    "nav.businesses": "کسب‌وکارها",
    "nav.users": "کاربران",
    "nav.plans": "پلن‌ها",
    "nav.subscriptions": "اشتراک‌ها",
    "nav.payments": "پرداخت‌ها",
    "nav.agents": "AI Agents",
    "nav.channels": "کانال‌ها",
    "nav.usage": "مصرف و Usage",
    "nav.support": "پشتیبانی",
    "nav.notifications": "اعلان‌ها",
    "nav.auditLogs": "Audit Logs",
    "nav.settings": "تنظیمات",
    
    // Settings sections
    "settings.general": "عمومی",
    "settings.security": "امنیت",
    "settings.notifications": "ایمیل و اعلان‌ها",
    "settings.ai": "AI Engine",
    "settings.billing": "پرداخت و صورت‌حساب",
    "settings.api": "API",
    "settings.appearance": "نمایش و زبان",
    
    // Common
    "common.search": "جستجو",
    "common.filter": "فیلتر",
    "common.export": "خروجی",
    "common.refresh": "بروزرسانی",
    "common.create": "افزودن",
    "common.edit": "ویرایش",
    "common.delete": "حذف",
    "common.view": "مشاهده",
    "common.status": "وضعیت",
    "common.actions": "عملیات",
    "common.active": "فعال",
    "common.inactive": "غیرفعال",
    "common.pending": "در انتظار",
    "common.success": "موفقیت",
    "common.failed": "ناموفق",
  },
  en: {
    "app.name": "AGENT-TO",
    "app.tagline": "Smart Admin Panel",
    "settings.title": "Settings",
    "settings.description": "Central settings for AGENT-TO platform",
    "save": "Save",
    "cancel": "Cancel",
    "loading": "Loading...",
    "error": "Error",
    "retry": "Retry",
    
    "theme.title": "Theme",
    "theme.description": "Choose color theme for UI",
    "theme.light": "Light",
    "theme.dark": "Dark",
    "theme.system": "System",
    
    "language.title": "Language",
    "language.description": "Choose UI language",
    "language.fa": "Persian",
    "language.en": "English",
    "language.ar": "Arabic",
    
    "nav.dashboard": "Dashboard",
    "nav.businesses": "Businesses",
    "nav.users": "Users",
    "nav.plans": "Plans",
    "nav.subscriptions": "Subscriptions",
    "nav.payments": "Payments",
    "nav.agents": "AI Agents",
    "nav.channels": "Channels",
    "nav.usage": "Usage",
    "nav.support": "Support",
    "nav.notifications": "Notifications",
    "nav.auditLogs": "Audit Logs",
    "nav.settings": "Settings",
    
    "settings.general": "General",
    "settings.security": "Security",
    "settings.notifications": "Email & Notifications",
    "settings.ai": "AI Engine",
    "settings.billing": "Billing & Invoices",
    "settings.api": "API",
    "settings.appearance": "Appearance & Language",
    
    "common.search": "Search",
    "common.filter": "Filter",
    "common.export": "Export",
    "common.refresh": "Refresh",
    "common.create": "Create",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "common.view": "View",
    "common.status": "Status",
    "common.actions": "Actions",
    "common.active": "Active",
    "common.inactive": "Inactive",
    "common.pending": "Pending",
    "common.success": "Success",
    "common.failed": "Failed",
  },
  ar: {
    "app.name": "AGENT-TO",
    "app.tagline": "لوحة إدارة ذكية",
    "settings.title": "الإعدادات",
    "settings.description": "إعدادات مركزية لمنصة AGENT-TO",
    "save": "حفظ",
    "cancel": "إلغاء",
    "loading": "جاري التحميل...",
    "error": "خطأ",
    "retry": "إعادة المحاولة",
    
    "theme.title": "السمة",
    "theme.description": "اختر سمة اللون للواجهة",
    "theme.light": "فاتح",
    "theme.dark": "داكن",
    "theme.system": "النظام",
    
    "language.title": "اللغة",
    "language.description": "اختر لغة الواجهة",
    "language.fa": "الفارسية",
    "language.en": "الإنجليزية",
    "language.ar": "العربية",
    
    "nav.dashboard": "لوحة التحكم",
    "nav.businesss": "الأعمال",
    "nav.users": "المستخدمون",
    "nav.plans": "الخطط",
    "nav.subscriptions": "الاشتراكات",
    "nav.payments": "المدفوعات",
    "nav.agents": "وكلاء الذكاء الاصطناعي",
    "nav.channels": "القنوات",
    "nav.usage": "الاستخدام",
    "nav.support": "الدعم",
    "nav.notifications": "الإشعارات",
    "nav.auditLogs": "سجلات التدقيق",
    "nav.settings": "الإعدادات",
    
    "settings.general": "عام",
    "settings.security": "الأمان",
    "settings.notifications": "البريد الإلكتروني والإشعارات",
    "settings.ai": "محرك الذكاء الاصطناعي",
    "settings.billing": "الفواتير والدفع",
    "settings.api": "API",
    "settings.appearance": "المظهر واللغة",
    
    "common.search": "بحث",
    "common.filter": "تصفية",
    "common.export": "تصدير",
    "common.refresh": "تحديث",
    "common.create": "إنشاء",
    "common.edit": "تعديل",
    "common.delete": "حذف",
    "common.view": "عرض",
    "common.status": "الحالة",
    "common.actions": "الإجراءات",
    "common.active": "نشط",
    "common.inactive": "غير نشط",
    "common.pending": "معلق",
    "common.success": "نجاح",
    "common.failed": "فشل",
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("fa");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("language") as Language | null;
    if (stored) {
      setLanguage(stored);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("language", language);
      document.documentElement.lang = language;
      document.documentElement.dir = language === "ar" || language === "fa" ? "rtl" : "ltr";
    }
  }, [language, mounted]);

  const t = (key: string, params?: Record<string, string>) => {
    if (!mounted) return key;
    let translation = translations[language][key] || translations.fa[key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        translation = translation.replace(new RegExp(`\\{${k}\\}`, "g"), v);
      });
    }
    return translation;
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: "fa" as Language,
      setLanguage: () => {},
      t: (key: string) => key,
    };
  }
  return context;
}