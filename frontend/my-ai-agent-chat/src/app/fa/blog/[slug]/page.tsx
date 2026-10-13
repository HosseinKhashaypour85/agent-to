import Link from "next/link";
import { ArrowRight, BookOpen, Bot } from "lucide-react";

export default async function PersianArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <main dir="rtl" className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-200">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5 sm:px-6">
          <Link href="/fa" className="flex items-center gap-2 font-black">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#10706B] text-white"><Bot size={20}/></span>
            Agent-To
          </Link>
          <Link href="/fa/blog" className="text-sm font-semibold text-[#10706B]">بازگشت به مجله</Link>
        </div>
      </header>
      <article className="mx-auto max-w-3xl px-5 py-16 sm:py-24">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-[#10706B]"><BookOpen size={23}/></div>
        <p className="mt-6 text-sm font-bold text-[#10706B]">مجله Agent-To</p>
        <h1 className="mt-3 text-3xl font-black leading-relaxed sm:text-4xl">این مقاله هنوز منتشر نشده است</h1>
        <p className="mt-5 text-sm leading-8 text-slate-600">شناسه مقاله: <span dir="ltr" className="inline-block">{slug}</span>. برای نمایش محتوای این صفحه، مقاله باید در CMS یا منبع محتوای سایت منتشر شود. محتوای فرضی به‌جای مقاله واقعی نمایش داده نمی‌شود.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/fa/blog" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold">همه مقاله‌ها <ArrowRight size={16}/></Link>
          <Link href="/fa/register" className="inline-flex items-center gap-2 rounded-xl bg-[#10706B] px-5 py-3 text-sm font-bold text-white">شروع با Agent-To <ArrowRight size={16}/></Link>
        </div>
      </article>
    </main>
  );
}
