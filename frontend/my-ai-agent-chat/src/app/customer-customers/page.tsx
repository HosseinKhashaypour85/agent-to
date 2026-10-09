"use client";
import CustomerResourcePage from "@/components/CustomerResourcePage";
export default function CustomerCustomersPage(){return <CustomerResourcePage title="مشتریان" description="فهرست مشتریان ثبت‌شده برای کسب‌وکار شما." endpoint="/customers" collection="customers" empty="هنوز مشتری‌ای ثبت نشده است."/>}
