"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ArrowLeft, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, Sparkles } from "lucide-react";

type LoginResult = {
  success: boolean;
  message?: string;
  data: {
    token: string;
    user: { id: string; tenantId: string; email: string; firstName?: string; lastName?: string; role: string };
  };
};

export default function CustomerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const result = await api<LoginResult>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
      });
      if (!result.success || !result.data?.token) {
        throw new Error(result.message || "ورود انجام نشد.");
      }
      window.sessionStorage.setItem("agentto_token", result.data.token);
      window.sessionStorage.setItem("agentto_user", JSON.stringify(result.data.user));
      router.replace("/customer-dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "ورود ناموفق بود.");
    } finally {
      setBusy(false);
    }
  }

  return <main dir="rtl" className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F5F8F6] px-4 py-10">
    <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#10706B]/10 blur-3xl"/>
    <div aria-hidden className="pointer-events-none absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-[#10706B]/10 blur-3xl"/>
    <section className="relative w-full max-w-md rounded-3xl border border-[#E2EBE7] bg-white p-6 shadow-xl shadow-[#153B3210] sm:p-9">
      <div className="mb-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#10706B] text-white shadow-lg shadow-[#10706B]/20"><Sparkles size={25}/></span>
        <h1 className="mt-4 text-2xl font-black tracking-tight text-[#173A35]">AGENT-TO</h1>
        <p className="mt-2 text-sm text-[#7C8C87]">ورود به پنل کسب‌وکار</p>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <label className="block"><span className="mb-2 block text-xs font-bold text-[#4E625C]">ایمیل</span><span className="flex items-center gap-2 rounded-xl border border-[#DDE7E2] px-3 focus-within:border-[#10706B]"><Mail size={17} className="text-[#879791]"/><input type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" dir="ltr" className="w-full py-3 text-sm outline-none" /></span></label>
        <label className="block"><span className="mb-2 block text-xs font-bold text-[#4E625C]">رمز عبور</span><span className="flex items-center gap-2 rounded-xl border border-[#DDE7E2] px-3 focus-within:border-[#10706B]"><LockKeyhole size={17} className="text-[#879791]"/><input type={showPassword?"text":"password"} required autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="رمز عبور" className="w-full py-3 text-sm outline-none"/><button type="button" onClick={()=>setShowPassword(v=>!v)} aria-label="نمایش رمز عبور" className="text-[#879791]">{showPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button></span></label>
        {error&&<p role="alert" className="rounded-xl bg-[#FFF0F0] p-3 text-xs leading-6 text-[#B42318]">{error}</p>}
        <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10706B] px-4 py-3.5 text-sm font-bold text-white transition hover:bg-[#0B5B57] disabled:opacity-60">{busy?<LoaderCircle size={17} className="animate-spin"/>:null}{busy?"در حال ورود...":"ورود به پنل"}<ArrowLeft size={16}/></button>
      </form>
      <p className="mt-5 text-center text-[11px] leading-6 text-[#87938F]">از همان ایمیل و رمزی استفاده کن که برای حساب مشتری ثبت کرده‌ای.</p>
    </section>
  </main>;
}
