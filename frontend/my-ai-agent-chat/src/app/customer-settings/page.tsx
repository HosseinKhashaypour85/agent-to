"use client";

import { useCallback, useEffect, useState } from "react";
import CustomerShell from "@/components/CustomerShell";
import { api } from "@/lib/api";
import { AlertCircle, LoaderCircle, RefreshCw, UserRound } from "lucide-react";

type User = { id: string; email: string; firstName?: string; lastName?: string; role?: string; tenantId?: string };

export default function CustomerSettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const result = await api<{ success: boolean; data: User }>("/auth/me");
      setUser(result.data);
      window.sessionStorage.setItem("agentto_user", JSON.stringify(result.data));
    } catch (e) { setError(e instanceof Error ? e.message : "دریافت حساب ناموفق بود."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return <CustomerShell>
    <div className="mb-7"><p className="mb-2 text-xs font-bold text-[#10706B]">حساب کاربری</p><h1 className="text-2xl font-black">تنظیمات حساب</h1><p className="mt-2 text-sm text-[#7D8D89]">اطلاعات حساب از API احراز هویت دریافت می‌شود.</p></div>
    {error && <div role="alert" className="mb-4 flex items-center gap-2 rounded-xl bg-[#FFF1F1] p-4 text-sm text-[#A62B2B]"><AlertCircle size={17}/>{error}</div>}
    <section className="max-w-2xl rounded-2xl border border-[#E4EBE8] bg-white p-6">
      <div className="mb-5 flex items-center justify-between"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#E8F4F0] text-[#10706B]"><UserRound size={20}/></span><div><h2 className="font-extrabold">اطلاعات حساب</h2><p className="mt-1 text-xs text-[#87938F]">اطلاعات ثبت‌شده در سیستم</p></div></div><button onClick={()=>void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold"><RefreshCw size={14}/>تازه‌سازی</button></div>
      {loading ? <div className="flex items-center gap-2 py-8 text-sm text-[#87938F]"><LoaderCircle size={17} className="animate-spin"/>در حال دریافت...</div> : user ? <dl className="grid gap-4 sm:grid-cols-2">{[["نام", [user.firstName,user.lastName].filter(Boolean).join(" ") || "—"],["ایمیل",user.email],["نقش",user.role || "—"],["شناسه حساب",user.tenantId || "—"]].map(([label,value])=><div key={label} className="rounded-xl bg-[#F7FAF8] p-4"><dt className="text-xs text-[#87938F]">{label}</dt><dd className="mt-2 break-all text-sm font-bold">{value}</dd></div>)}</dl> : null}
      <p className="mt-5 rounded-xl border border-[#E7ECEA] bg-[#FAFCFB] p-3 text-xs leading-6 text-[#7D8D89]">ویرایش اطلاعات هویتی یا تغییر رمز از این صفحه فعال نشده، چون API به‌روزرسانی امن حساب در بک‌اند موجود نیست.</p>
    </section>
  </CustomerShell>;
}
