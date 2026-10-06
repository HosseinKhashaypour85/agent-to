import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-9xl font-bold text-primary-light mb-4">۴۰۴</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">صفحه یافت نشد</h1>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          متأسفانه صفحه‌ای که به دنبال آن هستید وجود ندارد یا منتقل شده است.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/" className="btn-primary">
            <Home size={18} />
            بازگشت به داشبورد
          </Link>
          <Link href="/customers" className="btn-secondary">
            <Search size={18} />
            جستجوی مشتریان
          </Link>
        </div>
      </div>
    </div>
  );
}