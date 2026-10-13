import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Agent-To | دستیار هوشمند کسب‌وکار",
    template: "%s | Agent-To",
  },
  description: "با Agent-To پاسخ‌گویی به مشتریان، معرفی محصولات و مدیریت سرنخ‌های فروش را هوشمندتر کن.",
  alternates: { canonical: "/fa" },
  openGraph: {
    title: "Agent-To | دستیار هوشمند کسب‌وکار",
    description: "دستیار هوشمند برای ارتباط بهتر با مشتریان و رشد کسب‌وکار.",
    type: "website",
    locale: "fa_IR",
  },
};

export default function PersianLayout({ children }: { children: React.ReactNode }) {
  return <div lang="fa" dir="rtl" className="marketing-page min-h-screen">{children}</div>;
}
