"use client";
import CustomerResourcePage from "@/components/CustomerResourcePage";
export default function CustomerConversationsPage(){return <CustomerResourcePage title="مکالمات" description="مکالمات ثبت‌شده در حساب کسب‌وکار شما." endpoint="/conversations" collection="conversations" empty="هنوز مکالمه‌ای ثبت نشده است."/>}
