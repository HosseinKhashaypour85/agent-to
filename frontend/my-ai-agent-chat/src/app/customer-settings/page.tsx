"use client";
import CustomerResourcePage from "@/components/CustomerResourcePage";
export default function CustomerSettingsPage(){return <CustomerResourcePage title="تنظیمات حساب" description="اطلاعات حساب دریافت‌شده از سرویس احراز هویت." endpoint="/auth/me" collection="user" empty="اطلاعات حساب دریافت نشد."/>}
