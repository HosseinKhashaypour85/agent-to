"use client";
import CustomerResourcePage from "@/components/CustomerResourcePage";
export default function CustomerChannelsPage(){return <CustomerResourcePage title="کانال‌ها" description="کانال‌های متصل به ایجنت کسب‌وکار شما." endpoint="/agent/channels" collection="channels" empty="هنوز کانالی برای ایجنت ثبت نشده است."/>}
