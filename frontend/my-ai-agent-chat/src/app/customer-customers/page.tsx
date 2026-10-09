"use client";
import CustomerResourcePage from "@/components/CustomerResourcePage";
export default function CustomerCustomersPage() {
  return <CustomerResourcePage title="مشتریان" description="فهرست مشتریان متعلق به حساب شما." endpoint="/customers" emptyText="هنوز مشتری‌ای ثبت نشده است." />;
}
