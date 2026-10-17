"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowUpLeft,
  Bot,
  Check,
  ChevronDown,
  CircleHelp,
  LoaderCircle,
  Mail,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Zap,
} from "lucide-react";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "https://agentto.jorluma.ir/api/v1"
).replace(/\/$/, "");

const pageCopy: Record<
  string,
  { title: string; subtitle: string; eyebrow: string }
> = {
  features: {
    eyebrow: "امکانات Agent-To",
    title: "ابزارهای هوشمند برای ارتباط بهتر با مشتری",
    subtitle:
      "قابلیت‌های Agent-To را بشناس و ببین چطور می‌توانند مسیر پاسخ‌گویی و پیگیری مشتریان را منسجم‌تر کنند.",
  },
  solutions: {
    eyebrow: "راهکارها",
    title: "یک دستیار هوشمند، متناسب با جریان کاری شما",
    subtitle:
      "از فروشگاه آنلاین تا تیم خدمات؛ تجربه گفت‌وگو با مشتری را بر اساس نیاز واقعی کسب‌وکارت بهبود بده.",
  },
  pricing: {
    eyebrow: "تعرفه‌ها",
    title: "پلنی متناسب با نیاز کسب‌وکارت انتخاب کن",
    subtitle:
      "جزئیات پلن‌ها باید از اطلاعات رسمی سامانه فروش خوانده شوند؛ برای جلوگیری از نمایش قیمت نادرست، قیمت ساختگی درج نمی‌کنیم.",
  },
  about: {
    eyebrow: "درباره Agent-To",
    title: "هوش مصنوعی کاربردی برای کسب‌وکارها",
    subtitle:
      "Agent-To با هدف ساده‌تر کردن ارتباط آنلاین کسب‌وکارها با مشتریان و سازمان‌دهی بهتر فرصت‌های فروش ساخته شده است.",
  },
  contact: {
    eyebrow: "تماس با ما",
    title: "بیایید درباره نیاز کسب‌وکارتان صحبت کنیم",
    subtitle:
      "برای پرسش‌های مربوط به محصول، راه‌اندازی یا همکاری می‌توانید از طریق ایمیل با تیم ما در ارتباط باشید.",
  },
  faq: {
    eyebrow: "پشتیبانی",
    title: "سؤالات متداول",
    subtitle: "پاسخ پرسش‌های رایج درباره قابلیت‌ها و شروع کار با Agent-To.",
  },
  blog: {
    eyebrow: "مجله Agent-To",
    title: "ایده‌هایی برای تجربه بهتر مشتری",
    subtitle:
      "محتوای آموزشی درباره هوش مصنوعی، تجربه مشتری و بهبود فرایندهای کسب‌وکار.",
  },
  privacy: {
    eyebrow: "حریم خصوصی",
    title: "حریم خصوصی کاربران",
    subtitle:
      "این صفحه باید با شیوه‌های واقعی جمع‌آوری، پردازش، نگهداری و حذف داده در Agent-To تطبیق داده شود.",
  },
  terms: {
    eyebrow: "شرایط استفاده",
    title: "قوانین استفاده از Agent-To",
    subtitle:
      "پیش از انتشار نهایی، متن این صفحه باید با شرایط واقعی محصول و بازبینی حقوقی تکمیل شود.",
  },
  "refund-policy": {
    eyebrow: "بازپرداخت",
    title: "سیاست بازپرداخت",
    subtitle:
      "شرایط بازپرداخت باید پس از تأیید سیاست رسمی کسب‌وکار درج شود.",
  },
  demo: {
    eyebrow: "پیش‌نمایش محصول",
    title: "قبل از شروع، تجربه Agent-To را بشناس",
    subtitle:
      "در این صفحه نمایی از تجربه دستیار را ببین. برای گفت‌وگوی زنده باید یک سایت و پیکربندی معتبر انتخاب شود.",
  },
};

const featureItems = [
  {
    icon: MessageCircle,
    title: "گفت‌وگوی هوشمند",
    text: "پاسخ‌گویی به بازدیدکنندگان وب‌سایت با استفاده از تنظیمات و دانش کسب‌وکار.",
  },
  {
    icon: Sparkles,
    title: "دانش اختصاصی",
    text: "مدیریت اطلاعاتی که دستیار برای پاسخ‌گویی به مشتریان استفاده می‌کند.",
  },
  {
    icon: Target,
    title: "جذب سرنخ فروش",
    text: "کمک به شناسایی مشتریان بالقوه و منظم‌تر شدن فرایند پیگیری.",
  },
  {
    icon: Users,
    title: "ارتباط با مشتری",
    text: "مدیریت اطلاعات و گفت‌وگوها در کنار ابزارهای موجود پلتفرم.",
  },
  {
    icon: Zap,
    title: "اتصال به وب‌سایت",
    text: "ارائه تجربه چت در وب‌سایت و پشتیبانی از افزونه وردپرس موجود.",
  },
  {
    icon: ShieldCheck,
    title: "تنظیمات قابل کنترل",
    text: "شخصی‌سازی ظاهر و تنظیمات دستیار از پنل، مطابق امکانات فعال حساب.",
  },
];

const faqItems: [string, string][] = [
  [
    "Agent-To چیست؟",
    "پلتفرمی برای راه‌اندازی دستیار هوشمند کسب‌وکار و کمک به پاسخ‌گویی به بازدیدکنندگان وب‌سایت است.",
  ],
  [
    "چطور دستیار را به سایت وصل کنم؟",
    "روش اتصال به نوع نصب شما بستگی دارد. از پنل و راهنمای نصب فعلی استفاده کنید؛ افزونه وردپرس نیز در پروژه موجود است.",
  ],
  [
    "آیا تعرفه‌ها در سایت نمایش داده می‌شوند؟",
    "صفحه تعرفه آماده است، اما باید به API عمومی و تأییدشده پلن‌ها متصل شود تا قیمت و محدودیت واقعی نمایش داده شود.",
  ],
  [
    "چطور حساب بسازم؟",
    "از صفحه ثبت‌نام، نام، نام خانوادگی، ایمیل و رمز عبور را وارد کنید. درخواست به API احراز هویت Agent-To ارسال می‌شود.",
  ],
];

type Plan = {
  id: string | number;
  name: string;
  description?: string;
  price?: number | string;
  currency?: string;
  billingInterval?: string;
  isPopular?: boolean;
  maxAiMessages?: number;
  maxAgents?: number;
  maxProducts?: number;
  maxLeads?: number;
};

function Brand() {
  return (
    <Link href="/" className="group flex items-center gap-2.5 transition">
      <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#10706B] to-[#0b4f4b] text-white shadow-lg shadow-teal-900/20 transition group-hover:scale-105">
        <Bot size={22} className="relative z-10" />
        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      </span>
      <span className="text-lg font-black tracking-tight text-slate-950">
        Agent<span className="text-[#10706B]">-To</span>
      </span>
    </Link>
  );
}

function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const isRegister = mode === "register";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (isRegister && (!values.firstName.trim() || !values.lastName.trim())) {
      setError("نام و نام خانوادگی را وارد کنید.");
      return;
    }

    setBusy(true);
    try {
      const response = await fetch(`${API_URL}/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isRegister
            ? values
            : { email: values.email, password: values.password },
        ),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        const message = result.message || result.msg;
        if (response.status === 409)
          throw new Error("این ایمیل قبلاً ثبت شده است.");
        if (response.status === 401)
          throw new Error("ایمیل یا رمز عبور صحیح نیست.");
        throw new Error(message || "درخواست انجام نشد. دوباره تلاش کنید.");
      }

      if (isRegister) {
        setSuccess("حساب با موفقیت ایجاد شد. اکنون می‌توانید وارد شوید.");
        return;
      }

      const payload = result.data;
      const token =
        payload?.token || payload?.accessToken || payload?.access_token;

      if (token && typeof window !== "undefined") {
        sessionStorage.setItem("agentto_token", token);
        if (payload?.user)
          sessionStorage.setItem("agentto_user", JSON.stringify(payload.user));
        setSuccess("ورود موفق بود؛ در حال انتقال...");
        router.push("/customer-dashboard");
      } else {
        setSuccess(
          "ورود موفق بود، اما API توکن قابل ذخیره برنگرداند. با تیم فنی بررسی کنید.",
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "اتصال به سرور ناموفق بود.");
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-3 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10";

  return (
    <section className="relative mx-auto w-full max-w-md overflow-hidden rounded-[28px] border border-white/60 bg-white/80 p-7 shadow-[0_30px_90px_-40px_rgba(15,63,60,.35)] backdrop-blur-xl sm:p-9">
      <div className="pointer-events-none absolute -top-24 -left-24 h-48 w-48 rounded-full bg-teal-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-emerald-200/30 blur-3xl" />
      <div className="relative">
        <div className="mb-6 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100 text-[#10706B] ring-1 ring-teal-200/60">
          <ShieldCheck size={23} />
        </div>
        <h1 className="text-2xl font-black tracking-tight">
          {isRegister ? "ساخت حساب Agent-To" : "به Agent-To خوش آمدی"}
        </h1>
        <p className="mt-2 text-sm leading-7 text-slate-500">
          {isRegister
            ? "اطلاعاتت را وارد کن تا شروع کنیم."
            : "برای ورود به حساب خود اطلاعات را وارد کن."}
        </p>

        <form onSubmit={submit} className="mt-7 space-y-4">
          {isRegister && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="text-sm font-semibold">
                نام
                <input
                  required
                  autoComplete="given-name"
                  value={values.firstName}
                  onChange={(e) =>
                    setValues({ ...values, firstName: e.target.value })
                  }
                  className={inputClass}
                />
              </label>
              <label className="text-sm font-semibold">
                نام خانوادگی
                <input
                  required
                  autoComplete="family-name"
                  value={values.lastName}
                  onChange={(e) =>
                    setValues({ ...values, lastName: e.target.value })
                  }
                  className={inputClass}
                />
              </label>
            </div>
          )}
          <label className="block text-sm font-semibold">
            ایمیل
            <input
              type="email"
              required
              autoComplete="email"
              value={values.email}
              onChange={(e) => setValues({ ...values, email: e.target.value })}
              className={`${inputClass} text-left`}
              dir="ltr"
            />
          </label>
          <label className="block text-sm font-semibold">
            رمز عبور
            <input
              type="password"
              required
              minLength={6}
              autoComplete={isRegister ? "new-password" : "current-password"}
              value={values.password}
              onChange={(e) =>
                setValues({ ...values, password: e.target.value })
              }
              className={`${inputClass} text-left`}
              dir="ltr"
            />
          </label>
          {error && (
            <p
              role="alert"
              className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-sm leading-6 text-rose-700"
            >
              {error}
            </p>
          )}
          {success && (
            <p
              role="status"
              className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm leading-6 text-emerald-700"
            >
              {success}
            </p>
          )}
          <button
            disabled={busy}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#10706B] to-[#0b4f4b] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-900/20 transition hover:shadow-xl hover:shadow-teal-900/30 active:scale-[.98] disabled:opacity-60"
          >
            {busy && <LoaderCircle className="animate-spin" size={17} />}
            {isRegister ? "ایجاد حساب کاربری" : "ورود به حساب"}
            <ArrowLeft
              size={16}
              className="transition group-hover:-translate-x-1"
            />
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          {isRegister ? "قبلاً حساب ساخته‌ای؟" : "حساب کاربری نداری؟"}{" "}
          <Link
            className="font-bold text-[#10706B] hover:underline"
            href={isRegister ? "/login" : "/register"}
          >
            {isRegister ? "وارد شو" : "ثبت‌نام کن"}
          </Link>
        </p>
        <p className="mt-5 text-center text-xs leading-6 text-slate-400">
          با ادامه، استفاده از سرویس تابع قوانین و سیاست حریم خصوصی است.
        </p>
      </div>
    </section>
  );
}

function MarketingFooter() {
  const links: [string, string][] = [
    ["/features", "امکانات"],
    ["/pricing", "تعرفه‌ها"],
    ["/contact", "تماس با ما"],
    ["/privacy", "حریم خصوصی"],
    ["/terms", "قوانین"],
  ];
  return (
    <footer className="relative border-t border-slate-200 bg-gradient-to-b from-white to-slate-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <Brand />
          <p className="mt-3 text-xs text-slate-500">
            دستیار هوشمند برای ارتباط بهتر با مشتریان
          </p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-3 text-xs text-slate-500">
          {links.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="transition hover:text-[#10706B]"
            >
              {label}
            </Link>
          ))}
        </div>
        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} Agent-To
        </p>
      </div>
    </footer>
  );
}

export default function PersianMarketingSubpage() {
  const params = useParams<{ slug: string }>();
  const slug = String(params?.slug || "");
  const [health, setHealth] = useState<"checking" | "online" | "offline">(
    "checking",
  );
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState("");

  useEffect(() => {
    if (slug !== "pricing") return;
    let active = true;
    setPlansLoading(true);
    setPlansError("");
    fetch(`${API_URL}/public/plans`)
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok || !data.success)
          throw new Error(data.message || "دریافت تعرفه‌ها ناموفق بود.");
        return Array.isArray(data.plans) ? data.plans : [];
      })
      .then((data) => {
        if (active) setPlans(data);
      })
      .catch((e) => {
        if (active)
          setPlansError(
            e instanceof Error ? e.message : "دریافت تعرفه‌ها ناموفق بود.",
          );
      })
      .finally(() => {
        if (active) setPlansLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    if (slug !== "demo") return;
    let active = true;
    fetch(`${API_URL}/health`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((d) => {
        if (active) setHealth(d.success ? "online" : "offline");
      })
      .catch(() => {
        if (active) setHealth("offline");
      });
    return () => {
      active = false;
    };
  }, [slug]);

  const copy = pageCopy[slug];

  if (slug === "login" || slug === "register") {
    return (
      <main
        dir="rtl"
        className="relative min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top_left,rgba(16,112,107,.14),transparent_40%),radial-gradient(ellipse_at_bottom_right,rgba(16,112,107,.08),transparent_40%),#f8fbfa]"
      >
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,.03)_1px,transparent_1px)] bg-[size:32px_32px]" />
        <header className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6">
          <Brand />
          <Link
            href="/"
            className="text-sm font-semibold text-slate-600 transition hover:text-[#10706B]"
          >
            بازگشت به سایت
          </Link>
        </header>
        <div className="relative px-4 py-8 sm:py-14">
          <AuthForm mode={slug} />
        </div>
        <MarketingFooter />
      </main>
    );
  }

  if (!copy) {
    return (
      <main
        dir="rtl"
        className="mx-auto max-w-3xl px-5 py-24 text-center"
      >
        <h1 className="text-2xl font-black">این صفحه پیدا نشد</h1>
        <Link
          href="/"
          className="mt-5 inline-block font-semibold text-[#10706B] hover:underline"
        >
          بازگشت به صفحه اصلی
        </Link>
      </main>
    );
  }

  const isLegal = ["privacy", "terms", "refund-policy"].includes(slug);

  const navLinks: [string, string][] = [
    ["/features", "امکانات"],
    ["/solutions", "راهکارها"],
    ["/pricing", "تعرفه‌ها"],
    ["/faq", "سؤالات متداول"],
  ];

  return (
    <main dir="rtl" className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Brand />
          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
            {navLinks.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="relative transition hover:text-[#10706B] after:absolute after:-bottom-1 after:right-0 after:h-0.5 after:w-0 after:rounded-full after:bg-[#10706B] after:transition-all hover:after:w-full"
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-700 transition hover:text-[#10706B]"
            >
              ورود
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-gradient-to-br from-[#10706B] to-[#0b4f4b] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-teal-900/20 transition hover:shadow-xl hover:shadow-teal-900/30 active:scale-[.98]"
            >
              شروع رایگان
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[radial-gradient(ellipse_at_12%_0%,rgba(16,112,107,.14),transparent_45%),linear-gradient(180deg,#f8fcfb,white)] px-4 py-20 text-center sm:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,.025)_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
        <div className="pointer-events-none absolute -top-32 right-1/4 h-72 w-72 rounded-full bg-teal-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/4 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="relative">
          <p className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-white/70 px-4 py-1.5 text-xs font-extrabold text-[#10706B] shadow-sm backdrop-blur">
            <Sparkles size={13} /> {copy.eyebrow}
          </p>
          <h1 className="mx-auto mt-6 max-w-4xl text-3xl font-black leading-[1.45] tracking-tight sm:text-5xl sm:leading-[1.35]">
            {copy.title}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-8 text-slate-600 sm:text-base">
            {copy.subtitle}
          </p>
          {slug === "demo" && (
            <div className="mx-auto mt-7 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs text-slate-600 shadow-sm backdrop-blur">
              <span
                className={`h-2 w-2 rounded-full ${
                  health === "online"
                    ? "bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,.2)]"
                    : health === "offline"
                      ? "bg-rose-500 shadow-[0_0_0_3px_rgba(244,63,94,.2)]"
                      : "bg-amber-400 shadow-[0_0_0_3px_rgba(251,191,36,.2)]"
                }`}
              />
              {health === "checking"
                ? "در حال بررسی اتصال API…"
                : health === "online"
                  ? "ارتباط API برقرار است"
                  : "API در دسترس نیست؛ وضعیت اتصال را بررسی کنید"}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        {slug === "features" && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featureItems.map((f) => (
              <article
                key={f.title}
                className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-teal-200 hover:shadow-[0_30px_60px_-30px_rgba(15,63,60,.35)]"
              >
                <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-teal-50 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
                <span className="relative grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100 text-[#10706B] ring-1 ring-teal-200/60 transition group-hover:scale-105">
                  <f.icon size={22} />
                </span>
                <h2 className="relative mt-5 text-lg font-extrabold tracking-tight">
                  {f.title}
                </h2>
                <p className="relative mt-3 text-sm leading-7 text-slate-500">
                  {f.text}
                </p>
              </article>
            ))}
          </div>
        )}

        {slug === "solutions" && (
          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                title: "فروشگاه آنلاین",
                text: "راهنمایی مشتریان برای پیدا کردن محصولات و دریافت پاسخ به پرسش‌های خرید.",
              },
              {
                title: "کسب‌وکار خدماتی",
                text: "ارائه اطلاعات اولیه و هدایت مخاطب به مسیر ارتباطی مناسب.",
              },
              {
                title: "تیم فروش و پشتیبانی",
                text: "کمک به سازمان‌دهی پرسش‌ها و شناسایی سرنخ‌های قابل پیگیری.",
              },
            ].map((x) => (
              <article
                key={x.title}
                className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-30px_rgba(15,63,60,.35)]"
              >
                <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-teal-400/60 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-teal-50 to-teal-100 text-[#10706B] ring-1 ring-teal-200/60 transition group-hover:scale-105">
                  <Target size={20} />
                </span>
                <h2 className="mt-5 text-lg font-extrabold tracking-tight">
                  {x.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-500">
                  {x.text}
                </p>
              </article>
            ))}
          </div>
        )}

        {slug === "pricing" && (
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-500">
                پلن‌های فعال از API سامانه دریافت می‌شوند.
              </p>
              {plansLoading && (
                <span className="flex items-center gap-2 text-sm text-slate-500">
                  <LoaderCircle className="animate-spin" size={16} /> در حال
                  دریافت تعرفه‌ها
                </span>
              )}
            </div>

            {plansError && (
              <div
                role="alert"
                className="mb-5 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700"
              >
                {plansError}
              </div>
            )}

            {!plansLoading && !plansError && plans.length === 0 && (
              <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-10 text-center">
                <div className="pointer-events-none absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-teal-100/60 blur-3xl" />
                <CircleHelp
                  className="relative mx-auto text-[#10706B]"
                  size={32}
                />
                <h2 className="relative mt-4 text-xl font-extrabold">
                  فعلاً پلن فعالی برای نمایش وجود ندارد
                </h2>
                <p className="relative mt-3 text-sm leading-7 text-slate-500">
                  بعد از فعال‌سازی پلن‌ها در پنل مدیریت، قیمت‌ها در این بخش
                  نمایش داده می‌شوند.
                </p>
                <Link
                  href="/contact"
                  className="relative mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#10706B] to-[#0b4f4b] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-teal-900/20 transition hover:shadow-xl active:scale-[.98]"
                >
                  تماس با ما <ArrowLeft size={16} />
                </Link>
              </div>
            )}

            {plans.length > 0 && (
              <div className="grid gap-5 md:grid-cols-3">
                {plans.map((p) => (
                  <article
                    key={p.id}
                    className={`group relative overflow-hidden rounded-3xl border bg-white p-6 transition-all duration-300 hover:-translate-y-1.5 ${
                      p.isPopular
                        ? "border-[#10706B] shadow-[0_30px_70px_-30px_rgba(16,112,107,.5)]"
                        : "border-slate-200 hover:shadow-[0_30px_60px_-30px_rgba(15,63,60,.35)]"
                    }`}
                  >
                    {p.isPopular && (
                      <>
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-400 via-[#10706B] to-teal-400" />
                        <span className="absolute -top-3 right-5 rounded-full bg-gradient-to-br from-[#10706B] to-[#0b4f4b] px-3 py-1 text-xs font-bold text-white shadow-lg shadow-teal-900/30">
                          پیشنهاد ویژه
                        </span>
                      </>
                    )}
                    <h2 className="text-lg font-extrabold tracking-tight">
                      {p.name}
                    </h2>
                    <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">
                      {p.description || "پلن Agent-To"}
                    </p>
                    <p className="mt-5 text-2xl font-black tracking-tight text-slate-950">
                      {new Intl.NumberFormat("fa-IR").format(
                        Number(p.price || 0),
                      )}
                      <span className="mr-2 text-xs font-medium text-slate-500">
                        {p.currency === "IRT" ? "تومان" : p.currency}
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {p.billingInterval === "YEARLY"
                        ? "صورتحساب سالانه"
                        : "صورتحساب ماهانه"}
                    </p>
                    <div className="my-5 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                    <ul className="space-y-3 text-sm text-slate-600">
                      {(
                        [
                          [p.maxAiMessages, "پیام هوش مصنوعی"],
                          [p.maxAgents, "دستیار"],
                          [p.maxProducts, "محصول"],
                          [p.maxLeads, "سرنخ"],
                        ] as [number | undefined, string][]
                      ).map(([n, label]) => (
                        <li key={label} className="flex items-center gap-2">
                          <Check className="text-[#10706B]" size={16} />
                          <span>
                            {new Intl.NumberFormat("fa-IR").format(
                              Number(n || 0),
                            )}{" "}
                            {label}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/register"
                      className="mt-7 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#10706B] to-[#0b4f4b] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-teal-900/20 transition hover:shadow-xl active:scale-[.98]"
                    >
                      شروع با این پلن{" "}
                      <ArrowLeft
                        size={16}
                        className="transition group-hover:-translate-x-1"
                      />
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {slug === "faq" && (
          <div className="mx-auto max-w-3xl space-y-3">
            {faqItems.map((f, i) => (
              <div
                key={f[0]}
                className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
                  openFaq === i
                    ? "border-teal-200 bg-teal-50/40 shadow-[0_20px_50px_-30px_rgba(15,63,60,.4)]"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                  className="flex w-full items-center justify-between gap-3 px-5 py-5 text-right font-bold"
                >
                  <span>{f[0]}</span>
                  <ChevronDown
                    className={`transition-transform duration-300 ${
                      openFaq === i ? "rotate-180 text-[#10706B]" : "text-slate-400"
                    }`}
                    size={18}
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ${
                    openFaq === i
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm leading-8 text-slate-500">
                      {f[1]}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {slug === "contact" && (
          <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-2">
            <article className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7">
              <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-teal-50 blur-3xl" />
              <Mail className="relative text-[#10706B]" size={24} />
              <h2 className="relative mt-4 text-lg font-extrabold">
                ارتباط با تیم Agent-To
              </h2>
              <p className="relative mt-3 text-sm leading-7 text-slate-500">
                برای درخواست فروش یا پشتیبانی از کانال ارتباطی رسمی کسب‌وکار
                استفاده کنید.
              </p>
              <p className="relative mt-4 text-sm text-slate-500">
                نشانی ایمیل عمومی در تنظیمات فعلی پروژه تأیید نشده است؛ از درج
                ایمیل فرضی خودداری کرده‌ایم.
              </p>
            </article>
            <article className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0d3432] to-[#10706B] p-7 text-white shadow-[0_30px_70px_-30px_rgba(16,112,107,.6)]">
              <div className="pointer-events-none absolute -top-20 -left-20 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
              <MessageCircle className="relative" size={25} />
              <h2 className="relative mt-4 text-lg font-extrabold">
                هنوز حساب نساختی؟
              </h2>
              <p className="relative mt-3 text-sm leading-7 text-white/70">
                حساب بساز و امکانات پنل را بررسی کن.
              </p>
              <Link
                href="/register"
                className="relative mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#0d3432] transition hover:shadow-xl active:scale-[.98]"
              >
                ساخت حساب <ArrowUpLeft size={16} />
              </Link>
            </article>
          </div>
        )}

        {slug === "about" && (
          <div className="mx-auto max-w-3xl space-y-5 text-sm leading-8 text-slate-600">
            <p>
              کسب‌وکارها هر روز با پرسش‌های تکراری، درخواست‌های محصول و
              فرصت‌های ارتباطی تازه روبه‌رو می‌شوند. Agent-To برای کمک به
              سامان‌دهی این تعاملات و فراهم‌کردن تجربه دستیار هوشمند در وب‌سایت
              طراحی شده است.
            </p>
            <p>
              هدف ما ارائه ابزارهایی کاربردی برای پیکربندی دستیار، مدیریت دانش
              کسب‌وکار و پشتیبانی از جریان ارتباط با مشتری است؛ قابلیت‌های فعال
              هر حساب به تنظیمات و امکانات پیاده‌سازی‌شده بستگی دارد.
            </p>
            <div className="rounded-2xl border border-teal-100 bg-teal-50 p-5 text-[#145b56]">
              اصل ما: قابلیت واقعی، تجربه روشن و بدون وعده‌های ساختگی.
            </div>
          </div>
        )}

        {slug === "blog" && (
          <div className="mx-auto max-w-3xl rounded-3xl border border-dashed border-slate-300 bg-gradient-to-b from-white to-slate-50 p-10 text-center">
            <Sparkles className="mx-auto text-[#10706B]" size={28} />
            <h2 className="mt-4 text-lg font-extrabold">
              مقالات به‌زودی اضافه می‌شوند
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              برای انتشار مطالب واقعی، این بخش باید به CMS یا منبع محتوای
              تأییدشده متصل شود.
            </p>
          </div>
        )}

        {isLegal && (
          <div className="mx-auto max-w-3xl space-y-5 rounded-3xl border border-amber-200 bg-amber-50/70 p-6 text-sm leading-8 text-slate-700 sm:p-9">
            <p className="font-extrabold text-amber-900">
              پیش‌نویس — نیازمند تأیید پیش از انتشار
            </p>
            {slug === "privacy" && (
              <>
                <h2 className="text-lg font-extrabold">
                  اطلاعات و نحوه استفاده
                </h2>
                <p>
                  این متن چارچوب اولیه است و باید با اطلاعات واقعی درباره
                  داده‌های حساب، پیام‌ها، اطلاعات سایت، سرویس‌های پردازش و دوره
                  نگهداری تطبیق داده شود.
                </p>
                <h2 className="text-lg font-extrabold">درخواست‌های کاربران</h2>
                <p>
                  روش درخواست دسترسی، اصلاح یا حذف اطلاعات باید مطابق امکانات
                  عملیاتی سرویس تکمیل شود.
                </p>
              </>
            )}
            {slug === "terms" && (
              <>
                <h2 className="text-lg font-extrabold">استفاده از سرویس</h2>
                <p>
                  شرایط ایجاد حساب، مسئولیت اطلاعات ورودی، محدودیت استفاده و
                  تعلیق حساب باید توسط مالک سرویس تأیید شود.
                </p>
                <h2 className="text-lg font-extrabold">دسترسی و تغییرات</h2>
                <p>
                  قواعد دسترسی، تغییر قابلیت‌ها و شرایط اشتراک باید مطابق قرارداد
                  واقعی محصول تکمیل شوند.
                </p>
              </>
            )}
            {slug === "refund-policy" && (
              <>
                <h2 className="text-lg font-extrabold">شرایط بازپرداخت</h2>
                <p>
                  مهلت، موارد واجد شرایط و فرایند بازپرداخت هنوز در این صفحه
                  تأیید نشده‌اند؛ پیش از فروش باید سیاست رسمی درج شود.
                </p>
              </>
            )}
          </div>
        )}

        {slug === "demo" && (
          <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white p-2 shadow-[0_30px_90px_-35px_rgba(15,63,60,.3)] sm:p-3">
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div>
                <h2 className="font-extrabold">دموی زنده Agent-To</h2>
                <p className="mt-1 text-xs text-slate-500">
                  اتصال مستقیم به دستیار با شناسه AGENT-TO
                </p>
              </div>
              <span className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-bold text-[#10706B]">
                Live demo
              </span>
            </div>
            <iframe
              title="دموی زنده دستیار Agent-To"
              src="/widget?siteId=AGENT-TO"
              className="h-[720px] w-full rounded-2xl border border-slate-100 bg-slate-50"
              loading="lazy"
              allow="clipboard-write"
            />
          </div>
        )}
      </section>

      <MarketingFooter />
    </main>
  );
}