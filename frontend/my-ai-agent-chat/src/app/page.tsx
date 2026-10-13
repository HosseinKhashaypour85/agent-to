"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, ArrowUpLeft, ArrowUpRight, Bot, BrainCircuit, Check,
  ChevronDown, CircleHelp, Code2, Headphones, Menu, MessageCircle,
  MousePointer2, PackageSearch, ShieldCheck, Sparkles, Target, TrendingUp,
  Users, X, Zap,
} from "lucide-react";

const features = [
  { icon: MessageCircle, title: "پشتیبانی هوشمند", text: "به سؤال‌های پرتکرار مشتریان پاسخ بده و تجربه‌ای سریع و یکپارچه بساز." },
  { icon: PackageSearch, title: "شناخت محصولات", text: "اجازه بده مشتری‌ها محصولات مناسب را با گفت‌وگو پیدا و مقایسه کنند." },
  { icon: Target, title: "جذب و ارزیابی سرنخ", text: "اطلاعات مشتریان بالقوه را جمع‌آوری کن و فرصت‌های فروش را بهتر بشناس." },
  { icon: BrainCircuit, title: "دانش اختصاصی کسب‌وکار", text: "پاسخ‌ها را بر اساس اطلاعات و محتوای کسب‌وکار خودت شکل بده." },
  { icon: Users, title: "مدیریت ارتباط با مشتری", text: "گفت‌وگوها و سرنخ‌ها را در یک مسیر منظم‌تر دنبال کن." },
  { icon: TrendingUp, title: "گزارش و بینش", text: "عملکرد استفاده از دستیار را ببین و برای بهبود تجربه مشتری تصمیم بگیر." },
];

const faqs = [
  { q: "Agent-To دقیقاً چه کاری انجام می‌دهد؟", a: "Agent-To بستری برای ساخت و راه‌اندازی دستیار هوشمند کسب‌وکار است تا به پرسش‌های بازدیدکنندگان پاسخ دهد و در صورت پشتیبانی تنظیمات شما، به معرفی محصولات و جمع‌آوری سرنخ‌های فروش کمک کند." },
  { q: "آیا می‌توانم آن را به وب‌سایتم اضافه کنم؟", a: "بله، پلتفرم برای ارائه دستیار گفت‌وگو در وب‌سایت طراحی شده و افزونه وردپرس نیز در پروژه وجود دارد. جزئیات نصب را از پنل و مستندات فعلی دنبال کنید." },
  { q: "برای شروع به دانش فنی نیاز دارم؟", a: "هدف تجربه کاربری این است که تنظیمات اصلی از پنل انجام شود. مراحل دقیق راه‌اندازی به روش اتصال و امکانات فعال حساب شما بستگی دارد." },
  { q: "قیمت پلن‌ها چطور مشخص می‌شود؟", a: "تعرفه‌ها باید بر اساس پلن‌ها و محدودیت‌های واقعی حساب شما نمایش داده شوند. برای جلوگیری از نمایش اطلاعات نادرست، در این صفحه قیمت ساختگی درج نشده است." },
];

function Logo() {
  return <Link href="/" className="flex items-center gap-2.5" aria-label="Agent-To صفحه اصلی">
    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#10706B] text-white shadow-lg shadow-teal-900/15"><Bot size={23} /></span>
    <span className="text-[19px] font-extrabold tracking-tight text-slate-950">Agent<span className="text-[#10706B]">-To</span></span>
  </Link>;
}

function ChatPreview() {
  return <div className="relative mx-auto w-full max-w-[540px]">
    <div className="absolute -inset-5 rounded-[2.5rem] bg-teal-200/30 blur-3xl" />
    <div className="relative overflow-hidden rounded-[26px] border border-slate-200/90 bg-white shadow-[0_30px_90px_-35px_rgba(15,63,60,.32)]">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#10706B] text-white"><Sparkles size={19}/></span>
          <div><p className="font-bold text-slate-900">دستیار هوشمند فروش</p><p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500"/> آماده پاسخ‌گویی</p></div>
        </div>
        <span className="rounded-full bg-teal-50 px-3 py-1.5 text-[11px] font-semibold text-[#10706B]">دموی محصول</span>
      </div>
      <div className="space-y-5 bg-[#fbfdfd] px-5 py-6 sm:px-7">
        <div className="flex justify-start"><div className="max-w-[85%] rounded-2xl rounded-tr-md border border-slate-100 bg-white px-4 py-3 text-sm leading-7 text-slate-700 shadow-sm">سلام! 👋 دنبال چه محصول یا خدمتی هستید؟ خوشحال می‌شم راهنمایی‌تون کنم.</div></div>
        <div className="flex justify-end"><div className="max-w-[85%] rounded-2xl rounded-tl-md bg-[#10706B] px-4 py-3 text-sm leading-7 text-white">می‌خوام درباره امکانات دستیار هوشمند بیشتر بدونم.</div></div>
        <div className="flex justify-start gap-2.5">
          <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-teal-100 text-[#10706B]"><Bot size={17}/></span>
          <div className="max-w-[88%] rounded-2xl rounded-tr-md border border-slate-100 bg-white px-4 py-3 text-sm leading-7 text-slate-700 shadow-sm">Agent-To می‌تونه به پاسخ‌گویی به مشتریان، معرفی محصولات و ثبت سرنخ‌های فروش کمک کنه؛ همه‌چیز از پنل کسب‌وکار شما مدیریت می‌شه.</div>
        </div>
        <div className="flex flex-wrap gap-2 pr-10">
          {["امکانات بیشتر", "اتصال به سایت", "مدیریت سرنخ‌ها"].map((x) => <span key={x} className="rounded-full border border-teal-100 bg-white px-3 py-2 text-xs font-medium text-[#10706B]">{x}</span>)}
        </div>
      </div>
      <div className="border-t border-slate-100 bg-white p-4"><div className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-400"><span>پیامت رو بنویس...</span><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#10706B] text-white"><ArrowLeft size={17}/></span></div><p className="pt-3 text-center text-[10px] text-slate-400">پیش‌نمایش نمایشی رابط گفت‌وگو</p></div>
    </div>
    <div className="absolute -right-3 top-24 hidden items-center gap-2 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-xl sm:flex"><span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><Zap size={18}/></span><div><p className="text-xs font-bold text-slate-800">پاسخ‌گویی هوشمند</p><p className="mt-1 text-[10px] text-slate-400">تجربه بهتر برای مشتری</p></div></div>
    <div className="absolute -left-3 bottom-20 hidden items-center gap-2 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-xl sm:flex"><span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-700"><Users size={18}/></span><div><p className="text-xs font-bold text-slate-800">سرنخ‌های فروش</p><p className="mt-1 text-[10px] text-slate-400">منظم‌تر، قابل پیگیری</p></div></div>
  </div>;
}

export default function PersianMarketingHome() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const nav = [{ label: "امکانات", href: "#features" }, { label: "راهکارها", href: "#solutions" }, { label: "تعرفه‌ها", href: "#pricing" }, { label: "سؤالات متداول", href: "#faq" }];
  return <main dir="rtl" className="min-h-screen overflow-hidden bg-white text-slate-900">
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex">{nav.map(n => <a key={n.href} href={n.href} className="text-sm font-medium text-slate-600 transition hover:text-[#10706B]">{n.label}</a>)}</nav>
        <div className="hidden items-center gap-3 md:flex"><Link href="/login" className="px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:text-[#10706B]">ورود</Link><Link href="/register" className="inline-flex items-center gap-2 rounded-xl bg-[#10706B] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-teal-900/15 transition hover:-translate-y-0.5 hover:bg-[#0c5e59]">شروع رایگان <ArrowUpLeft size={16}/></Link></div>
        <button onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "بستن منو" : "باز کردن منو"} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 md:hidden">{menuOpen ? <X size={20}/> : <Menu size={20}/>}</button>
      </div>
      {menuOpen && <div className="border-t border-slate-100 bg-white px-5 py-4 md:hidden"><nav className="flex flex-col gap-1">{nav.map(n => <a key={n.href} href={n.href} onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-3 text-sm font-medium hover:bg-slate-50">{n.label}</a>)}<Link href="/login" className="rounded-xl px-3 py-3 text-sm font-semibold">ورود</Link><Link href="/register" className="mt-1 rounded-xl bg-[#10706B] px-4 py-3 text-center text-sm font-bold text-white">شروع رایگان</Link></nav></div>}
    </header>

    <section className="relative isolate border-b border-slate-100 bg-[radial-gradient(ellipse_at_8%_12%,rgba(16,112,107,.10),transparent_35%),linear-gradient(180deg,#fbfefd_0%,#fff_100%)]">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[.92fr_1.08fr] lg:gap-16 lg:px-8 lg:py-28">
        <div className="relative z-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-100 bg-white/80 px-4 py-2 text-xs font-bold text-[#10706B] shadow-sm"><Sparkles size={15}/> دستیار هوشمند برای رشد کسب‌وکار</div>
          <h1 className="max-w-2xl text-4xl font-black leading-[1.45] tracking-tight text-slate-950 sm:text-5xl lg:text-[58px]">هر گفت‌وگو،<br/><span className="text-[#10706B]">یک فرصت تازه</span> برای رشد.</h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">با Agent-To به مشتریانت سریع‌تر پاسخ بده، محصولاتت رو بهتر معرفی کن و سرنخ‌های فروش رو هوشمندانه‌تر مدیریت کن؛ همه در یک تجربه یکپارچه.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/register" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#10706B] px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-teal-900/15 transition hover:-translate-y-0.5 hover:bg-[#0c5e59]">شروع رایگان <ArrowUpLeft size={17}/></Link><Link href="/ai-agent?siteId=AGENT-TO-AI" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:border-teal-200 hover:text-[#10706B]">مشاهده پیش‌نمایش <ArrowUpRight size={17}/></Link></div>
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-slate-500"><span className="flex items-center gap-2"><Check size={15} className="text-[#10706B]"/> راه‌اندازی متمرکز از پنل</span><span className="flex items-center gap-2"><Check size={15} className="text-[#10706B]"/> قابل استفاده در وب‌سایت</span></div>
        </div>
        <div id="demo" className="min-w-0"><ChatPreview /></div>
      </div>
      <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8"><div className="grid grid-cols-2 gap-3 rounded-3xl border border-slate-200/80 bg-white/80 p-4 sm:grid-cols-4 sm:p-6">{[{icon:MessageCircle,title:"گفت‌وگوی هوشمند",sub:"تعامل بهتر با بازدیدکننده"},{icon:PackageSearch,title:"شناخت محصول",sub:"راهنمایی برای انتخاب"},{icon:Target,title:"مدیریت سرنخ",sub:"پیگیری فرصت‌های فروش"},{icon:ShieldCheck,title:"تجربه یکپارچه",sub:"تنظیمات متمرکز کسب‌وکار"}].map(x=><div key={x.title} className="flex items-start gap-3 p-2 sm:p-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal-50 text-[#10706B]"><x.icon size={19}/></span><div><p className="text-xs font-extrabold sm:text-sm">{x.title}</p><p className="mt-1 text-[10px] leading-5 text-slate-500 sm:text-xs">{x.sub}</p></div></div>)}</div></div>
    </section>

    <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-2xl text-center"><p className="text-sm font-extrabold text-[#10706B]">امکانات پلتفرم</p><h2 className="mt-4 text-3xl font-black leading-tight tracking-tight sm:text-4xl">ابزارهایی برای یک تجربه <span className="text-[#10706B]">هوشمندتر</span></h2><p className="mt-5 text-sm leading-8 text-slate-500 sm:text-base">از اولین سؤال مشتری تا شناسایی فرصت فروش، ابزارهای موردنیاز را در یک مسیر منسجم کنار هم قرار بده.</p></div>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">{features.map((f,i)=><article key={f.title} className="group rounded-3xl border border-slate-200/80 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-[0_20px_55px_-30px_rgba(16,112,107,.28)] sm:p-7"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#edf8f6] text-[#10706B] transition group-hover:bg-[#10706B] group-hover:text-white"><f.icon size={22}/></span><h3 className="mt-6 text-lg font-extrabold">{f.title}</h3><p className="mt-3 text-sm leading-7 text-slate-500">{f.text}</p><a href="#solutions" className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[#10706B]">بیشتر بدانید <ArrowLeft size={14}/></a></article>)}</div>
    </section>

    <section id="solutions" className="bg-[#f6faf9] py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div><p className="text-sm font-extrabold text-[#10706B]">برای کسب‌وکار شما</p><h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">از پاسخ‌گویی روزمره تا <span className="text-[#10706B]">فرصت‌های فروش</span></h2><p className="mt-5 max-w-xl text-sm leading-8 text-slate-600 sm:text-base">Agent-To کمک می‌کند اطلاعات کسب‌وکارت در دسترس‌تر باشد و گفت‌وگوهای سایت مسیر روشن‌تری پیدا کنند.</p><div className="mt-8 space-y-4">{[{icon:Headphones,title:"پشتیبانی مشتریان",text:"پاسخ‌های سریع‌تر و تجربه منظم‌تر برای بازدیدکنندگان."},{icon:PackageSearch,title:"فروشگاه‌های آنلاین",text:"راهنمایی مشتری برای پیدا کردن محصول و اطلاعات موردنیاز."},{icon:Users,title:"تیم‌های فروش",text:"جمع‌آوری و سازمان‌دهی سرنخ‌های بالقوه در جریان گفت‌وگو."}].map(s=><div key={s.title} className="flex gap-4 rounded-2xl border border-slate-200/70 bg-white p-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-teal-50 text-[#10706B]"><s.icon size={20}/></span><div><h3 className="font-extrabold">{s.title}</h3><p className="mt-1 text-sm leading-6 text-slate-500">{s.text}</p></div></div>)}</div></div>
        <div className="relative rounded-[2rem] border border-teal-100 bg-white p-5 shadow-[0_25px_70px_-40px_rgba(16,112,107,.35)] sm:p-8"><div className="flex items-center justify-between border-b border-slate-100 pb-5"><div><p className="text-xs text-slate-400">نمای مفهومی پنل</p><h3 className="mt-1 text-lg font-black">نمای کلی دستیار</h3></div><span className="rounded-xl bg-teal-50 p-3 text-[#10706B]"><BrainCircuit size={23}/></span></div><div className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">وضعیت دستیار</p><p className="mt-3 flex items-center gap-2 text-sm font-extrabold"><span className="h-2 w-2 rounded-full bg-emerald-500"/> آماده تنظیم</p></div><div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">کانال ارتباطی</p><p className="mt-3 text-sm font-extrabold">وب‌سایت</p></div></div><div className="mt-4 rounded-2xl border border-slate-100 p-4"><div className="mb-4 flex items-center justify-between"><span className="text-sm font-extrabold">جریان گفت‌وگو</span><span className="text-xs text-slate-400">پیش‌نمایش</span></div>{["پرسش مشتری دریافت شد","اطلاعات کسب‌وکار بررسی شد","پاسخ مناسب آماده شد"].map((x,i)=><div key={x} className="flex items-center gap-3 border-t border-slate-100 py-3"><span className="grid h-7 w-7 place-items-center rounded-lg bg-teal-50 text-xs font-bold text-[#10706B]">{i+1}</span><span className="text-xs text-slate-600">{x}</span><Check className="mr-auto text-emerald-600" size={15}/></div>)}</div><p className="mt-4 text-[11px] leading-6 text-slate-400">این بخش پیش‌نمایش مفهومی است و آمار زنده یا اطلاعات واقعی مشتریان را نمایش نمی‌دهد.</p></div>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8"><div className="rounded-[2rem] bg-[#0d3432] px-6 py-12 text-white sm:px-12 sm:py-16 lg:px-16"><div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]"><div><span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-teal-100"><Sparkles size={14}/> شروع ساده، مسیر روشن</span><h2 className="mt-5 max-w-2xl text-3xl font-black leading-tight sm:text-4xl">دستیار کسب‌وکارت را آماده کن.</h2><p className="mt-4 max-w-2xl text-sm leading-8 text-teal-50/75">از پنل شروع کن، اطلاعات کسب‌وکارت را تنظیم کن و تجربه دستیار را متناسب با نیاز مشتریانت بساز.</p></div><Link href="/register" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-4 text-sm font-extrabold text-[#0d3432] transition hover:-translate-y-0.5">ساخت حساب کاربری <ArrowUpLeft size={17}/></Link></div></div></section>

    <section id="pricing" className="border-y border-slate-100 bg-[#fbfcfc] py-20 sm:py-24"><div className="mx-auto max-w-4xl px-4 text-center sm:px-6"><p className="text-sm font-extrabold text-[#10706B]">تعرفه‌ها</p><h2 className="mt-4 text-3xl font-black sm:text-4xl">پلنی متناسب با نیازت انتخاب کن</h2><p className="mx-auto mt-4 max-w-2xl text-sm leading-8 text-slate-500">برای اینکه قیمت یا محدودیت اشتباهی نمایش داده نشود، جزئیات پلن‌ها را از اطلاعات رسمی حساب و سامانه فروش بررسی کن.</p><div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"><Link href="/register" className="inline-flex items-center gap-2 rounded-xl bg-[#10706B] px-6 py-3.5 text-sm font-bold text-white hover:bg-[#0c5e59]">شروع از پنل <ArrowLeft size={16}/></Link><Link href="/contact" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 hover:border-teal-200">گفت‌وگو با تیم ما <MessageCircle size={16}/></Link></div></div></section>

    <section id="faq" className="mx-auto max-w-4xl px-4 py-20 sm:px-6 sm:py-28"><div className="text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-[#10706B]"><CircleHelp size={24}/></span><h2 className="mt-4 text-3xl font-black sm:text-4xl">سؤالات متداول</h2><p className="mt-3 text-sm text-slate-500">پاسخ چند سؤال پیش از شروع</p></div><div className="mt-10 space-y-3">{faqs.map((f,i)=><div key={f.q} className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><button onClick={()=>setOpenFaq(openFaq===i?null:i)} aria-expanded={openFaq===i} className="flex w-full items-center justify-between gap-4 px-5 py-5 text-right text-sm font-extrabold sm:px-6"><span>{f.q}</span><ChevronDown size={18} className={`shrink-0 text-[#10706B] transition-transform ${openFaq===i?"rotate-180":""}`}/></button>{openFaq===i&&<div className="px-5 pb-5 text-sm leading-8 text-slate-500 sm:px-6">{f.a}</div>}</div>)}</div></section>

    <footer className="border-t border-slate-200 bg-white"><div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr] lg:px-8"><div><Logo/><p className="mt-4 max-w-sm text-sm leading-7 text-slate-500">Agent-To؛ دستیار هوشمند برای ارتباط بهتر با مشتریان و ساخت تجربه‌ای منسجم‌تر در وب‌سایت.</p></div><div><h3 className="text-sm font-extrabold">محصول</h3><div className="mt-4 flex flex-col gap-3 text-sm text-slate-500"><a href="#features" className="hover:text-[#10706B]">امکانات</a><a href="#solutions" className="hover:text-[#10706B]">راهکارها</a><a href="#pricing" className="hover:text-[#10706B]">تعرفه‌ها</a><a href="#demo" className="hover:text-[#10706B]">پیش‌نمایش</a></div></div><div><h3 className="text-sm font-extrabold">حساب کاربری</h3><div className="mt-4 flex flex-col gap-3 text-sm text-slate-500"><Link href="/login" className="hover:text-[#10706B]">ورود</Link><Link href="/register" className="hover:text-[#10706B]">ثبت‌نام</Link><Link href="/contact" className="hover:text-[#10706B]">تماس با ما</Link><Link href="/privacy" className="hover:text-[#10706B]">حریم خصوصی</Link><Link href="/terms" className="hover:text-[#10706B]">قوانین استفاده</Link></div></div></div><div className="border-t border-slate-100 px-4 py-5 text-center text-xs text-slate-400">© {new Date().getFullYear()} Agent-To. تمامی حقوق محفوظ است.</div></footer>
  </main>;
}
