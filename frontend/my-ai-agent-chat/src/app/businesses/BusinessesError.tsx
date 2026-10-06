"use client";

import { AlertCircle } from "lucide-react";

export default function BusinessesError() {
  return (
    <div className="panel p-10 text-center">
      <div className="grid h-16 w-16 place-items-center mx-auto rounded-full bg-[#FDEAEA] text-[#C0392B] mb-4">
        <AlertCircle size={28} />
      </div>
      <h3 className="text-lg font-black text-[#0B2B29] mb-2">خطا در بارگذاری کسب‌وکارها</h3>
      <p className="text-muted mb-4">امکان اتصال به سرور وجود ندارد. لطفاً مجدداً تلاش کنید.</p>
      <button
        onClick={() => window.location.reload()}
        className="btn-primary"
      >
        تلاش مجدد
      </button>
    </div>
  );
}