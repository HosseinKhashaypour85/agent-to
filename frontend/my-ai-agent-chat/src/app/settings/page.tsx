import Shell from "@/components/Shell";
import PageHeader from "@/components/PageHeader";
export default function Settings(){return <Shell><PageHeader title="تنظیمات" description="تنظیمات مرکزی پلتفرم AGENT-TO"/><div className="grid lg:grid-cols-3 gap-5">{["عمومی","امنیت","ایمیل و اعلان‌ها","AI Engine","پرداخت و صورتحساب","API"].map(x=><div className="card p-6 hover:border-brand-200 cursor-pointer" key={x}><div className="font-bold">{x}</div><div className="text-xs text-slate-400 mt-2">مدیریت تنظیمات {x}</div></div>)}</div></Shell>}
