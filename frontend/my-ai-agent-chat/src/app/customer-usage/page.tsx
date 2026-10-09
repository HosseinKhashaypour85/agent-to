"use client";

import { useCallback, useEffect, useState } from "react";
import CustomerShell from "@/components/CustomerShell";
import { api } from "@/lib/api";
import { Activity, AlertCircle, LoaderCircle, RefreshCw } from "lucide-react";

type Usage = {
  summary?: {
    aiMessages?: number;
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
    requests?: number;
  };
  daily?: Array<{ date: string; aiMessages: number; totalTokens: number }>;
};

const numberFa = (value?: number) =>
  new Intl.NumberFormat("fa-IR").format(Number.isFinite(value) ? Number(value) : 0);

export default function CustomerUsagePage() {
  const [usage, setUsage] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api<{ success: boolean; data: Usage; message?: string }>("/usage/me");
      if (!response?.success || !response.data) {
        throw new Error(response?.message || "پاسخ گزارش مصرف معتبر نیست.");
      }
      setUsage(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "دریافت گزارش مصرف ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const summary = usage?.summary;

  return (
    <CustomerShell>
      <div className="mb-7 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold text-[#10706B]">حساب کاربری</p>
          <h1 className="text-2xl font-black">مصرف هوش مصنوعی</h1>
          <p className="mt-2 text-sm text-[#7D8D89]">آمار واقعی مصرف ثبت‌شده برای حساب شما.</p>
        </div>
        <button onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-3 text-sm font-bold disabled:opacity-50">
          <RefreshCw size={16} /> تازه‌سازی
        </button>
      </div>

      {error && (
        <div role="alert" className="mb-4 flex gap-2 rounded-xl bg-[#FFF1F1] p-4 text-sm text-[#A62B2B]">
          <AlertCircle size={18} /> <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border bg-white p-12 text-sm text-[#87938F]">
          <LoaderCircle className="animate-spin" size={18} /> در حال دریافت گزارش از API...
        </div>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "پاسخ‌های هوش مصنوعی", value: summary?.aiMessages },
              { label: "کل توکن‌ها", value: summary?.totalTokens },
              { label: "توکن ورودی", value: summary?.inputTokens },
              { label: "توکن خروجی", value: summary?.outputTokens },
            ].map((item) => (
              <article key={item.label} className="rounded-2xl border border-[#E4EBE8] bg-white p-5">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#E8F4F0] text-[#10706B]">
                  <Activity size={19} />
                </span>
                <p className="mt-4 text-xs text-[#87938F]">{item.label}</p>
                <b className="mt-1 block text-2xl">{numberFa(item.value)}</b>
              </article>
            ))}
          </section>

          <section className="mt-5 overflow-hidden rounded-2xl border border-[#E4EBE8] bg-white">
            <div className="border-b p-5">
              <h2 className="font-extrabold">مصرف روزانه</h2>
              <p className="mt-1 text-xs text-[#87938F]">تعداد درخواست‌ها: {numberFa(summary?.requests)}</p>
            </div>
            {(usage?.daily ?? []).length === 0 ? (
              <p className="p-8 text-center text-sm text-[#87938F]">در این بازه مصرفی ثبت نشده است.</p>
            ) : (
              <div className="divide-y">
                {usage?.daily?.map((day) => (
                  <div key={day.date} className="flex items-center justify-between gap-4 px-5 py-4 text-sm">
                    <span>{new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(new Date(day.date))}</span>
                    <span className="text-[#7D8D89]">
                      {numberFa(day.aiMessages)} پاسخ · {numberFa(day.totalTokens)} توکن
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </CustomerShell>
  );
}
