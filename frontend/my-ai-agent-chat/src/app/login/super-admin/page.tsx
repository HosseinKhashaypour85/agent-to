"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
      role: string;
    };
  };
}

export default function SuperAdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("ایمیل و رمز عبور را وارد کنید.");
      return;
    }

    try {
      setLoading(true);

      const response = await api<LoginResponse>("/admin/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (!response.success) {
        throw new Error(response.message || "ورود ناموفق بود.");
      }

      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطایی در ورود رخ داد.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden bg-[#050B0A] px-4 py-6 sm:px-6 sm:py-10">
      {/* پس‌زمینه ساده: دو radial-gradient، بدون blur و بدون انیمیشن */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 85% 10%, rgba(16,112,107,0.22), transparent 70%), radial-gradient(60% 50% at 15% 90%, rgba(14,165,160,0.18), transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-md sm:max-w-[420px]">
        {/* Brand */}
        <div className="mb-6 text-center sm:mb-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#10706B] to-[#0A4F4B] shadow-lg shadow-[#10706B]/30 ring-1 ring-white/10 sm:mb-5 sm:h-16 sm:w-16">
            <span className="text-xl font-black text-white sm:text-2xl">A</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-[26px]">
            AGENT-TO
          </h1>

          <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.2em] text-white/40 sm:text-[11px]">
            Super Admin Panel
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-white/[0.08] bg-[#0A1413] p-5 shadow-2xl shadow-black/50 sm:p-8">
          <div className="mb-6 sm:mb-7">
            <h2 className="text-lg font-semibold text-white sm:text-xl">
              ورود مدیر سیستم
            </h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-white/40 sm:text-sm">
              برای ورود به پنل مدیریت AGENT-TO اطلاعات خود را وارد کنید.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-xs font-medium text-white/60 sm:text-[13px]"
              >
                ایمیل
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                autoComplete="email"
                inputMode="email"
                disabled={loading}
                dir="ltr"
                className="w-full rounded-xl border border-white/[0.08] bg-black/30 px-3.5 py-3 text-left text-sm text-white outline-none transition-colors placeholder:text-white/20 hover:border-white/15 focus:border-[#14B8A6]/60 disabled:opacity-50 sm:px-4 sm:py-3.5"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-xs font-medium text-white/60 sm:text-[13px]"
              >
                رمز عبور
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={loading}
                  dir="ltr"
                  className="w-full rounded-xl border border-white/[0.08] bg-black/30 px-3.5 py-3 pl-11 text-left text-sm text-white outline-none transition-colors placeholder:text-white/20 hover:border-white/15 focus:border-[#14B8A6]/60 disabled:opacity-50 sm:px-4 sm:py-3.5 sm:pl-12"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "پنهان کردن رمز" : "نمایش رمز"}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-white/30 transition-colors hover:text-[#14B8A6] sm:left-3"
                >
                  {showPassword ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-3 text-xs text-red-300 sm:px-4 sm:text-[13px]">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full rounded-xl bg-gradient-to-br from-[#10706B] to-[#0A4F4B] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#10706B]/25 transition-colors hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:mt-2 sm:rounded-2xl sm:py-3.5"
            >
              {loading ? "در حال ورود..." : "ورود به پنل"}
            </button>
          </form>

          <p className="mt-6 text-center text-[10px] text-white/25 sm:text-[11px]">
            AGENT-TO • Secure Administration
          </p>
        </div>
      </div>
    </main>
  );
}