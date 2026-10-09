"use client";
import CustomerResourcePage from "@/components/CustomerResourcePage";
export default function CustomerConversationsPage() {
  return <CustomerResourcePage title="مکالمات مشتریان" description="مکالمات ثبت‌شده در حساب شما از API دریافت می‌شوند." endpoint="/conversations" emptyText="هنوز مکالمه‌ای ثبت نشده است." />;
}
