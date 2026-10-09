"use client";
import CustomerResourcePage from "@/components/CustomerResourcePage";
export default function CustomerLeadsPage() {
  return <CustomerResourcePage title="سرنخ‌های فروش" description="سرنخ‌های فروش حساب شما مستقیماً از API دریافت می‌شوند." endpoint="/leads" emptyText="هنوز سرنخ فروشی ثبت نشده است." />;
}
