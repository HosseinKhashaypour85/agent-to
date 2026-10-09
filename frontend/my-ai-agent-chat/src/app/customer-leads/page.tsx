"use client";
import CustomerResourcePage from "@/components/CustomerResourcePage";
export default function CustomerLeadsPage(){return <CustomerResourcePage title="سرنخ‌های فروش" description="سرنخ‌های فروش ثبت‌شده برای کسب‌وکار شما." endpoint="/leads" collection="leads" empty="هنوز سرنخ فروشی ثبت نشده است."/>}
