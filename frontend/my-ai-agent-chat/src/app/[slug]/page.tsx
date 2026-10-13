"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft, ArrowUpLeft, Bot, Check, ChevronDown, CircleHelp, LoaderCircle,
  Mail, MessageCircle, ShieldCheck, Sparkles, Target, Users, Zap,
} from "lucide-react";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "https://agent-to.darkube.ir/api/v1").replace(/\/$/, "");

const pageCopy: Record<string, { title: string; subtitle: string; eyebrow: string }> = {
  features: { eyebrow: "امکانات Agent-To", title: "ابزارهای هوشمند برای ارتباط بهتر با مشتری", subtitle: "قابلیت‌های Agent-To را بشناس و ببین چطور می‌توانند مسیر پاسخ‌گویی و پیگیری مشتریان را منسجم‌تر کنند." },
  solutions: { eyebrow: "راهکارها", title: "یک دستیار هوشمند، متناسب با جریان کاری شما", subtitle: "از فروشگاه آنلاین تا تیم خدمات؛ تجربه گفت‌وگو با مشتری را بر اساس نیاز واقعی کسب‌وکارت بهبود بده." },
  pricing: { eyebrow: "تعرفه‌ها", title: "پلنی متناسب با نیاز کسب‌وکارت انتخاب کن", subtitle: "جزئیات پلن‌ها باید از اطلاعات رسمی سامانه فروش خوانده شوند؛ برای جلوگیری از نمایش قیمت نادرست، قیمت ساختگی درج نمی‌کنیم." },
  about: { eyebrow: "درباره Agent-To", title: "هوش مصنوعی کاربردی برای کسب‌وکارها", subtitle: "Agent-To با هدف ساده‌تر کردن ارتباط آنلاین کسب‌وکارها با مشتریان و سازمان‌دهی بهتر فرصت‌های فروش ساخته شده است." },
  contact: { eyebrow: "تماس با ما", title: "بیایید درباره نیاز کسب‌وکارتان صحبت کنیم", subtitle: "برای پرسش‌های مربوط به محصول، راه‌اندازی یا همکاری می‌توانید از طریق ایمیل با تیم ما در ارتباط باشید." },
  faq: { eyebrow: "پشتیبانی", title: "سؤالات متداول", subtitle: "پاسخ پرسش‌های رایج درباره قابلیت‌ها و شروع کار با Agent-To." },
  blog: { eyebrow: "مجله Agent-To", title: "ایده‌هایی برای تجربه بهتر مشتری", subtitle: "محتوای آموزشی درباره هوش مصنوعی، تجربه مشتری و بهبود فرایندهای کسب‌وکار." },
  privacy: { eyebrow: "حریم خصوصی", title: "حریم خصوصی کاربران", subtitle: "این صفحه باید با شیوه‌های واقعی جمع‌آوری، پردازش، نگهداری و حذف داده در Agent-To تطبیق داده شود." },
  terms: { eyebrow: "شرایط استفاده", title: "قوانین استفاده از Agent-To", subtitle: "پیش از انتشار نهایی، متن این صفحه باید با شرایط واقعی محصول و بازبینی حقوقی تکمیل شود." },
  "refund-policy": { eyebrow: "بازپرداخت", title: "سیاست بازپرداخت", subtitle: "شرایط بازپرداخت باید پس از تأیید سیاست رسمی کسب‌وکار درج شود." },
  demo: { eyebrow: "پیش‌نمایش محصول", title: "قبل از شروع، تجربه Agent-To را بشناس", subtitle: "در این صفحه نمایی از تجربه دستیار را ببین. برای گفت‌وگوی زنده باید یک سایت و پیکربندی معتبر انتخاب شود." },
};

const featureItems = [
  { icon: MessageCircle, title: "گفت‌وگوی هوشمند", text: "پاسخ‌گویی به بازدیدکنندگان وب‌سایت با استفاده از تنظیمات و دانش کسب‌وکار." },
  { icon: Sparkles, title: "دانش اختصاصی", text: "مدیریت اطلاعاتی که دستیار برای پاسخ‌گویی به مشتریان استفاده می‌کند." },
  { icon: Target, title: "جذب سرنخ فروش", text: "کمک به شناسایی مشتریان بالقوه و منظم‌تر شدن فرایند پیگیری." },
  { icon: Users, title: "ارتباط با مشتری", text: "مدیریت اطلاعات و گفت‌وگوها در کنار ابزارهای موجود پلتفرم." },
  { icon: Zap, title: "اتصال به وب‌سایت", text: "ارائه تجربه چت در وب‌سایت و پشتیبانی از افزونه وردپرس موجود." },
  { icon: ShieldCheck, title: "تنظیمات قابل کنترل", text: "شخصی‌سازی ظاهر و تنظیمات دستیار از پنل، مطابق امکانات فعال حساب." },
];
const faqItems = [
  ["Agent-To چیست؟", "پلتفرمی برای راه‌اندازی دستیار هوشمند کسب‌وکار و کمک به پاسخ‌گویی به بازدیدکنندگان وب‌سایت است."],
  ["چطور دستیار را به سایت وصل کنم؟", "روش اتصال به نوع نصب شما بستگی دارد. از پنل و راهنمای نصب فعلی استفاده کنید؛ افزونه وردپرس نیز در پروژه موجود است."],
  ["آیا تعرفه‌ها در سایت نمایش داده می‌شوند؟", "صفحه تعرفه آماده است، اما باید به API عمومی و تأییدشده پلن‌ها متصل شود تا قیمت و محدودیت واقعی نمایش داده شود."],
  ["چطور حساب بسازم؟", "از صفحه ثبت‌نام، نام، نام خانوادگی، ایمیل و رمز عبور را وارد کنید. درخواست به API احراز هویت Agent-To ارسال می‌شود."],
];

function Brand() {
  return <Link href="/" className="flex items-center gap-2.5"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#10706B] text-white"><Bot size={22}/></span><span className="text-lg font-black text-slate-950">Agent<span className="text-[#10706B]">-To</span></span></Link>;
}

function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [values, setValues] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const isRegister = mode === "register";
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(""); setSuccess("");
    if (isRegister && (!values.firstName.trim() || !values.lastName.trim())) {
      setError("نام و نام خانوادگی را وارد کنید."); return;
    }
    setBusy(true);
    try {
      const response = await fetch(`${API_URL}/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isRegister ? values : { email: values.email, password: values.password }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.success) {
        const message = result.message || result.msg;
        if (response.status === 409) throw new Error("این ایمیل قبلاً ثبت شده است.");
        if (response.status === 401) throw new Error("ایمیل یا رمز عبور صحیح نیست.");
        throw new Error(message || "درخواست انجام نشد. دوباره تلاش کنید.");
      }
      if (isRegister) {
        setSuccess("حساب با موفقیت ایجاد شد. اکنون می‌توانید وارد شوید.");
        return;
      }
      const payload = result.data;
      const token = payload?.token || payload?.accessToken || payload?.access_token;
      if (token && typeof window !== "undefined") {
        sessionStorage.setItem("agentto_token", token);
        if (payload?.user) sessionStorage.setItem("agentto_user", JSON.stringify(payload.user));
        setSuccess("ورود موفق بود؛ در حال انتقال...");
        router.push("/customer-dashboard");
      } else {
        setSuccess("ورود موفق بود، اما API توکن قابل ذخیره برنگرداند. با تیم فنی بررسی کنید.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "اتصال به سرور ناموفق بود.");
    } finally { setBusy(false); }
  }
  return <section className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_80px_-45px_rgba(15,63,60,.3)] sm:p-8">
    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-[#10706B]"><ShieldCheck size={23}/></div>
    <h1 className="text-2xl font-black">{isRegister ? "ساخت حساب Agent-To" : "به Agent-To خوش آمدی"}</h1>
    <p className="mt-2 text-sm leading-7 text-slate-500">{isRegister ? "اطلاعاتت را وارد کن تا شروع کنیم." : "برای ورود به حساب خود اطلاعات را وارد کن."}</p>
    <form onSubmit={submit} className="mt-7 space-y-4">
      {isRegister && <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><label className="text-sm font-semibold">نام<input required autoComplete="given-name" value={values.firstName} onChange={e=>setValues({...values,firstName:e.target.value})} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-teal-600" /></label><label className="text-sm font-semibold">نام خانوادگی<input required autoComplete="family-name" value={values.lastName} onChange={e=>setValues({...values,lastName:e.target.value})} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-teal-600" /></label></div>}
      <label className="block text-sm font-semibold">ایمیل<input type="email" required autoComplete="email" value={values.email} onChange={e=>setValues({...values,email:e.target.value})} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-left outline-none focus:border-teal-600" dir="ltr" /></label>
      <label className="block text-sm font-semibold">رمز عبور<input type="password" required minLength={6} autoComplete={isRegister?"new-password":"current-password"} value={values.password} onChange={e=>setValues({...values,password:e.target.value})} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-left outline-none focus:border-teal-600" dir="ltr" /></label>
      {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm leading-6 text-rose-700">{error}</p>}
      {success && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm leading-6 text-emerald-700">{success}</p>}
      <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10706B] px-4 py-3.5 text-sm font-bold text-white disabled:opacity-60">{busy&&<LoaderCircle className="animate-spin" size={17}/>} {isRegister?"ایجاد حساب کاربری":"ورود به حساب"} <ArrowLeft size={16}/></button>
    </form>
    <p className="mt-6 text-center text-sm text-slate-500">{isRegister?"قبلاً حساب ساخته‌ای؟":"حساب کاربری نداری؟"} <Link className="font-bold text-[#10706B]" href={isRegister?"/customer-login":"/register"}>{isRegister?"وارد شو":"ثبت‌نام کن"}</Link></p>
    <p className="mt-5 text-center text-xs leading-6 text-slate-400">با ادامه، استفاده از سرویس تابع قوانین و سیاست حریم خصوصی است.</p>
  </section>;
}

function MarketingFooter() {
  return <footer className="border-t border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8"><div><Brand/><p className="mt-3 text-xs text-slate-500">دستیار هوشمند برای ارتباط بهتر با مشتریان</p></div><div className="flex flex-wrap gap-x-5 gap-y-3 text-xs text-slate-500"><Link href="/features">امکانات</Link><Link href="/pricing">تعرفه‌ها</Link><Link href="/contact">تماس با ما</Link><Link href="/privacy">حریم خصوصی</Link><Link href="/terms">قوانین</Link></div><p className="text-xs text-slate-400">© {new Date().getFullYear()} Agent-To</p></div></footer>;
}

export default function PersianMarketingSubpage() {
  const params = useParams<{ slug: string }>();
  const slug = String(params?.slug || "");
  const [health, setHealth] = useState<"checking" | "online" | "offline">("checking");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [plans, setPlans] = useState<any[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState("");
  useEffect(() => {
    if (slug !== "pricing") return;
    let active = true;
    setPlansLoading(true);
    fetch(`${API_URL}/public/plans`)
      .then(async r => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok || !data.success) throw new Error(data.message || "دریافت تعرفه‌ها ناموفق بود.");
        return Array.isArray(data.plans) ? data.plans : [];
      })
      .then(data => { if (active) setPlans(data); })
      .catch(e => { if (active) setPlansError(e instanceof Error ? e.message : "دریافت تعرفه‌ها ناموفق بود."); })
      .finally(() => { if (active) setPlansLoading(false); });
    return () => { active = false; };
  }, [slug]);
  useEffect(() => {
    if (slug !== "demo") return;
    let active = true;
    fetch(`${API_URL}/health`).then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => { if (active) setHealth(d.success ? "online" : "offline"); })
      .catch(() => { if (active) setHealth("offline"); });
    return () => { active = false; };
  }, [slug]);
  const copy = pageCopy[slug];
  if (slug === "login" || slug === "register") return <main dir="rtl" className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,rgba(16,112,107,.12),transparent_35%),#f8fbfa]"><header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6"><Brand/><Link href="/" className="text-sm font-semibold text-slate-600">بازگشت به سایت</Link></header><div className="px-4 py-8 sm:py-14"><AuthForm mode={slug}/></div><MarketingFooter/></main>;
  if (!copy) return <main dir="rtl" className="mx-auto max-w-3xl px-5 py-24 text-center"><h1 className="text-2xl font-black">این صفحه پیدا نشد</h1><Link href="/" className="mt-5 inline-block text-[#10706B]">بازگشت به صفحه اصلی</Link></main>;
  const isLegal = ["privacy","terms","refund-policy"].includes(slug);
  return <main dir="rtl" className="min-h-screen bg-white text-slate-900">
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl"><div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"><Brand/><nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex"><Link href="/features">امکانات</Link><Link href="/solutions">راهکارها</Link><Link href="/pricing">تعرفه‌ها</Link><Link href="/faq">سؤالات متداول</Link></nav><div className="flex items-center gap-3"><Link href="/customer-login" className="text-sm font-semibold">ورود</Link><Link href="/register" className="rounded-xl bg-[#10706B] px-4 py-2.5 text-sm font-bold text-white">شروع رایگان</Link></div></div></header>
    <section className="bg-[radial-gradient(ellipse_at_12%_0%,rgba(16,112,107,.12),transparent_35%),linear-gradient(180deg,#f8fcfb,white)] px-4 py-16 text-center sm:py-24"><p className="text-sm font-extrabold text-[#10706B]">{copy.eyebrow}</p><h1 className="mx-auto mt-4 max-w-4xl text-3xl font-black leading-[1.5] sm:text-5xl">{copy.title}</h1><p className="mx-auto mt-5 max-w-2xl text-sm leading-8 text-slate-600 sm:text-base">{copy.subtitle}</p>
      {slug==="demo"&&<div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600"><span className={`h-2 w-2 rounded-full ${health==="online"?"bg-emerald-500":health==="offline"?"bg-rose-500":"bg-amber-400"}`}/>{health==="checking"?"در حال بررسی اتصال API…":health==="online"?"ارتباط API برقرار است":"API در دسترس نیست؛ وضعیت اتصال را بررسی کنید"}</div>}
    </section>
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      {slug==="features"&&<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{featureItems.map(f=><article key={f.title} className="rounded-3xl border border-slate-200 p-6 transition hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-[#10706B]"><f.icon size={22}/></span><h2 className="mt-5 text-lg font-extrabold">{f.title}</h2><p className="mt-3 text-sm leading-7 text-slate-500">{f.text}</p></article>)}</div>}
      {slug==="solutions"&&<div className="grid gap-4 md:grid-cols-3">{[{title:"فروشگاه آنلاین",text:"راهنمایی مشتریان برای پیدا کردن محصولات و دریافت پاسخ به پرسش‌های خرید."},{title:"کسب‌وکار خدماتی",text:"ارائه اطلاعات اولیه و هدایت مخاطب به مسیر ارتباطی مناسب."},{title:"تیم فروش و پشتیبانی",text:"کمک به سازمان‌دهی پرسش‌ها و شناسایی سرنخ‌های قابل پیگیری."}].map(x=><article key={x.title} className="rounded-3xl border border-slate-200 bg-white p-7"><span className="grid h-11 w-11 place-items-center rounded-xl bg-teal-50 text-[#10706B]"><Target size={20}/></span><h2 className="mt-5 text-lg font-extrabold">{x.title}</h2><p className="mt-3 text-sm leading-7 text-slate-500">{x.text}</p></article>)}</div>}
      {slug==="pricing"&&<div className="mx-auto max-w-6xl"><div className="mb-8 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-slate-500">پلن‌های فعال از API سامانه دریافت می‌شوند.</p>{plansLoading&&<span className="flex items-center gap-2 text-sm text-slate-500"><LoaderCircle className="animate-spin" size={16}/> در حال دریافت تعرفه‌ها</span>}</div>{plansError&&<div role="alert" className="mb-5 rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">{plansError}</div>}{!plansLoading&&!plansError&&plans.length===0&&<div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center"><CircleHelp className="mx-auto text-[#10706B]" size={32}/><h2 className="mt-4 text-xl font-extrabold">فعلاً پلن فعالی برای نمایش وجود ندارد</h2><p className="mt-3 text-sm leading-7 text-slate-500">بعد از فعال‌سازی پلن‌ها در پنل مدیریت، قیمت‌ها در این بخش نمایش داده می‌شوند.</p><Link href="/contact" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#10706B] px-5 py-3 text-sm font-bold text-white">تماس با ما <ArrowLeft size={16}/></Link></div>}<div className="grid gap-4 md:grid-cols-3">{plans.map((p:any)=><article key={p.id} className={`relative rounded-3xl border bg-white p-6 ${p.isPopular?"border-[#10706B] shadow-xl shadow-teal-900/10":"border-slate-200"}`}>{p.isPopular&&<span className="absolute -top-3 right-5 rounded-full bg-[#10706B] px-3 py-1 text-xs font-bold text-white">پیشنهاد ویژه</span>}<h2 className="text-lg font-extrabold">{p.name}</h2><p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">{p.description||"پلن Agent-To"}</p><p className="mt-5 text-2xl font-black text-slate-950">{new Intl.NumberFormat("fa-IR").format(Number(p.price||0))}<span className="mr-2 text-xs font-medium text-slate-500">{p.currency==="IRT"?"تومان":p.currency}</span></p><p className="mt-1 text-xs text-slate-400">{p.billingInterval==="YEARLY"?"صورتحساب سالانه":"صورتحساب ماهانه"}</p><div className="my-5 h-px bg-slate-100"/><ul className="space-y-3 text-sm text-slate-600">{[[p.maxAiMessages,"پیام هوش مصنوعی"],[p.maxAgents,"دستیار"],[p.maxProducts,"محصول"],[p.maxLeads,"سرنخ"]].map(([n,label]:any)=><li key={label} className="flex items-center gap-2"><Check className="text-[#10706B]" size={16}/><span>{new Intl.NumberFormat("fa-IR").format(Number(n||0))} {label}</span></li>)}</ul><Link href="/register" className="mt-7 flex items-center justify-center gap-2 rounded-xl bg-[#10706B] px-4 py-3 text-sm font-bold text-white">شروع با این پلن <ArrowLeft size={16}/></Link></article>)}</div></div>}
      {slug==="faq"&&<div className="mx-auto max-w-3xl space-y-3">{faqItems.map((f,i)=><div key={f[0]} className="overflow-hidden rounded-2xl border border-slate-200"><button onClick={()=>setOpenFaq(openFaq===i?null:i)} aria-expanded={openFaq===i} className="flex w-full items-center justify-between gap-3 px-5 py-5 text-right font-bold"><span>{f[0]}</span><ChevronDown className={openFaq===i?"rotate-180 text-[#10706B]":"text-slate-400"} size={18}/></button>{openFaq===i&&<p className="px-5 pb-5 text-sm leading-8 text-slate-500">{f[1]}</p>}</div>)}</div>}
      {slug==="contact"&&<div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-2"><article className="rounded-3xl border border-slate-200 p-7"><Mail className="text-[#10706B]" size={24}/><h2 className="mt-4 text-lg font-extrabold">ارتباط با تیم Agent-To</h2><p className="mt-3 text-sm leading-7 text-slate-500">برای درخواست فروش یا پشتیبانی از کانال ارتباطی رسمی کسب‌وکار استفاده کنید.</p><p className="mt-4 text-sm text-slate-500">نشانی ایمیل عمومی در تنظیمات فعلی پروژه تأیید نشده است؛ از درج ایمیل فرضی خودداری کرده‌ایم.</p></article><article className="rounded-3xl bg-[#0d3432] p-7 text-white"><MessageCircle size={25}/><h2 className="mt-4 text-lg font-extrabold">هنوز حساب نساختی؟</h2><p className="mt-3 text-sm leading-7 text-white/70">حساب بساز و امکانات پنل را بررسی کن.</p><Link href="/register" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#0d3432]">ساخت حساب <ArrowUpLeft size={16}/></Link></article></div>}
      {slug==="about"&&<div className="mx-auto max-w-3xl space-y-5 text-sm leading-8 text-slate-600"><p>کسب‌وکارها هر روز با پرسش‌های تکراری، درخواست‌های محصول و فرصت‌های ارتباطی تازه روبه‌رو می‌شوند. Agent-To برای کمک به سامان‌دهی این تعاملات و فراهم‌کردن تجربه دستیار هوشمند در وب‌سایت طراحی شده است.</p><p>هدف ما ارائه ابزارهایی کاربردی برای پیکربندی دستیار، مدیریت دانش کسب‌وکار و پشتیبانی از جریان ارتباط با مشتری است؛ قابلیت‌های فعال هر حساب به تنظیمات و امکانات پیاده‌سازی‌شده بستگی دارد.</p><div className="rounded-2xl border border-teal-100 bg-teal-50 p-5 text-[#145b56]">اصل ما: قابلیت واقعی، تجربه روشن و بدون وعده‌های ساختگی.</div></div>}
      {slug==="blog"&&<div className="mx-auto max-w-3xl rounded-3xl border border-dashed border-slate-300 p-10 text-center"><Sparkles className="mx-auto text-[#10706B]" size={28}/><h2 className="mt-4 text-lg font-extrabold">مقالات به‌زودی اضافه می‌شوند</h2><p className="mt-3 text-sm leading-7 text-slate-500">برای انتشار مطالب واقعی، این بخش باید به CMS یا منبع محتوای تأییدشده متصل شود.</p></div>}
      {isLegal&&<div className="mx-auto max-w-3xl space-y-5 rounded-3xl border border-amber-200 bg-amber-50/70 p-6 text-sm leading-8 text-slate-700 sm:p-9"><p className="font-extrabold text-amber-900">پیش‌نویس — نیازمند تأیید پیش از انتشار</p>{slug==="privacy"?<><h2 className="text-lg font-extrabold">اطلاعات و نحوه استفاده</h2><p>این متن چارچوب اولیه است و باید با اطلاعات واقعی درباره داده‌های حساب، پیام‌ها، اطلاعات سایت، سرویس‌های پردازش و دوره نگهداری تطبیق داده شود.</p><h2 className="text-lg font-extrabold">درخواست‌های کاربران</h2><p>روش درخواست دسترسی، اصلاح یا حذف اطلاعات باید مطابق امکانات عملیاتی سرویس تکمیل شود.</p></>:slug==="terms"?<><h2 className="text-lg font-extrabold">استفاده از سرویس</h2><p>شرایط ایجاد حساب، مسئولیت اطلاعات ورودی، محدودیت استفاده و تعلیق حساب باید توسط مالک سرویس تأیید شود.</p><h2 className="text-lg font-extrabold">دسترسی و تغییرات</h2><p>قواعد دسترسی، تغییر قابلیت‌ها و شرایط اشتراک باید مطابق قرارداد واقعی محصول تکمیل شوند.</p></>:<><h2 className="text-lg font-extrabold">شرایط بازپرداخت</h2><p>مهلت، موارد واجد شرایط و فرایند بازپرداخت هنوز در این صفحه تأیید نشده‌اند؛ پیش از فروش باید سیاست رسمی درج شود.</p></>}</div>}
      {slug==="demo"&&<div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 p-8 text-center"><Bot className="mx-auto text-[#10706B]" size={32}/><h2 className="mt-4 text-xl font-extrabold">دموی زنده نیاز به پیکربندی سایت دارد</h2><p className="mt-3 text-sm leading-7 text-slate-500">API گفت‌وگو به siteId معتبر نیاز دارد. برای جلوگیری از ارسال پیام به سایت مشتری دیگر، این صفحه بدون انتخاب یک سایت آزمایشی، گفت‌وگوی زنده را فعال نمی‌کند.</p><Link href="/register" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#10706B] px-5 py-3 text-sm font-bold text-white">شروع با حساب خودم <ArrowLeft size={16}/></Link></div>}
    </section>
    <MarketingFooter/>
  </main>;
}
