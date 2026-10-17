

"use client";

import { useCallback, useEffect, useState } from "react";
import CustomerShell from "@/components/CustomerShell";
import { api } from "@/lib/api";
import { AlertCircle, CheckCircle2, Code2, LoaderCircle, RefreshCw, Save, ShoppingCart } from "lucide-react";

type Endpoint = { key: string; label: string; url: string; method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"; enabled: boolean; payload: string };
type Site = { id: string; name?: string; domain?: string; status?: string };
const templates: Endpoint[] = [
  { key: "products", label: "جست‌وجو و دریافت محصولات", url: "", method: "GET", enabled: true, payload: "" },
  { key: "getCart", label: "دریافت سبد خرید", url: "", method: "GET", enabled: true, payload: "" },
  { key: "addToCart", label: "افزودن محصول به سبد خرید", url: "", method: "POST", enabled: true, payload: JSON.stringify({ productId: "{{product.id}}", quantity: "{{quantity}}" }, null, 2) },
  { key: "updateCartItem", label: "تغییر تعداد محصول سبد", url: "", method: "PATCH", enabled: true, payload: JSON.stringify({ productId: "{{product.id}}", quantity: "{{quantity}}" }, null, 2) },
  { key: "removeCartItem", label: "حذف محصول از سبد", url: "", method: "DELETE", enabled: true, payload: JSON.stringify({ productId: "{{product.id}}" }, null, 2) },
  { key: "clearCart", label: "خالی‌کردن سبد خرید", url: "", method: "DELETE", enabled: false, payload: "" },
  { key: "checkout", label: "ثبت نهایی سفارش / پرداخت", url: "", method: "POST", enabled: true, payload: JSON.stringify({ cartId: "{{cart.id}}", customerId: "{{customer.id}}" }, null, 2) },
  { key: "orderStatus", label: "دریافت وضعیت سفارش", url: "", method: "GET", enabled: true, payload: "" },
  { key: "createInvoice", label: "ایجاد یا دریافت فاکتور سفارش", url: "", method: "POST", enabled: false, payload: JSON.stringify({ orderId: "{{order.id}}", customerId: "{{customer.id}}" }, null, 2) },
];
const methods: Endpoint["method"][] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

export default function CustomerCartIntegrationPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [siteId, setSiteId] = useState("");
  const [endpoints, setEndpoints] = useState<Endpoint[]>(templates);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadSites = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const result = await api<any>("/sites");
      const list: Site[] = Array.isArray(result?.data) ? result.data : [];
      setSites(list);
      if (list.length) setSiteId(current => list.some(site => site.id === current) ? current : list[0].id);
      else setSiteId("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "دریافت سایت‌ها ناموفق بود.");
    } finally { setLoading(false); }
  }, []);

  const loadConfig = useCallback(async (selectedSite: string) => {
    if (!selectedSite) { setEndpoints(templates); return; }
    try {
      const result = await api<any>(`/cart-integrations?siteId=${encodeURIComponent(selectedSite)}`);
      const saved = Array.isArray(result?.data?.endpoints) ? result.data.endpoints : [];
      const byKey = new Map(saved.map((item: Endpoint) => [item.key, item]));
      setEndpoints(templates.map(template => ({ ...template, ...(byKey.get(template.key) || {}) })));
    } catch (e) {
      setError(e instanceof Error ? e.message : "تنظیمات قبلی دریافت نشد.");
    }
  }, []);

  useEffect(() => { void loadSites(); }, [loadSites]);
  useEffect(() => { if (siteId) void loadConfig(siteId); }, [siteId, loadConfig]);

  function update(index: number, patch: Partial<Endpoint>) {
    setEndpoints(current => current.map((item, i) => i === index ? { ...item, ...patch } : item));
    setNotice("");
  }

  async function save() {
    if (!siteId) { setError("ابتدا یک سایت ثبت کنید."); return; }
    setSaving(true); setError(""); setNotice("");
    try {
      const result = await api<any>("/cart-integrations", {
        method: "PUT",
        body: JSON.stringify({ siteId, endpoints }),
      });
      if (!result?.success) throw new Error(result?.message || "ذخیره تنظیمات ناموفق بود.");
      setNotice("تنظیمات API سبد خرید ذخیره شد.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "ذخیره تنظیمات ناموفق بود.");
    } finally { setSaving(false); }
  }

  return <CustomerShell>
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="mb-2 text-xs font-bold text-[#10706B]">اتصال فروشگاه</p>
        <h1 className="text-2xl font-black">API سبد خرید سایت کدنویسی</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#7D8D89]">برای سایت‌های اختصاصی، endpointهای بک‌اند خودت را معرفی کن تا قرارداد API فروشگاه مستند و برای اتصال آماده باشد.</p>
      </div>
      <button onClick={() => void loadConfig(siteId)} disabled={!siteId || loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E2EAE6] bg-white px-4 py-3 text-sm font-bold disabled:opacity-50"><RefreshCw size={16}/> بارگذاری مجدد</button>
    </div>

    {error && <div role="alert" className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><AlertCircle size={18} className="shrink-0"/><span>{error}</span></div>}
    {notice && <div role="status" className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"><CheckCircle2 size={18}/>{notice}</div>}

    <section className="mb-6 rounded-2xl border border-[#E2EAE6] bg-white p-5">
      <label htmlFor="site" className="mb-2 block text-sm font-bold">سایت موردنظر</label>
      {loading ? <div className="flex items-center gap-2 text-sm text-[#7D8D89]"><LoaderCircle size={16} className="animate-spin"/> در حال دریافت سایت‌ها…</div> :
      <select id="site" value={siteId} onChange={e => setSiteId(e.target.value)} className="w-full rounded-xl border border-[#DCE6E1] bg-white px-4 py-3 text-sm outline-none focus:border-[#10706B]">
        <option value="">انتخاب سایت</option>{sites.map(site => <option key={site.id} value={site.id}>{site.name || site.domain || site.id} {site.domain ? `— ${site.domain}` : ""}</option>)}
      </select>}
      {!loading && !sites.length && <p className="mt-2 text-sm text-amber-700">هنوز سایتی در حساب شما ثبت نشده است؛ ابتدا از بخش سایت‌ها یک سایت اضافه کن.</p>}
    </section>

    <div className="mb-5 flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sm leading-6 text-sky-900">
      <Code2 size={20} className="mt-0.5 shrink-0"/>
      <div><strong>نکته مهم:</strong> هر سایت کدنویسی‌شده API مخصوص خودش را دارد؛ Agent-To نمی‌تواند آدرس endpoint را حدس بزند. آدرس‌ها و قرارداد payload را از توسعه‌دهنده بک‌اند سایت بگیر. اطلاعات محرمانه مثل API Key یا رمز را اینجا وارد نکن.</div>
    </div>

    <div className="space-y-4">
      {endpoints.map((endpoint, index) => <section key={endpoint.key} className="rounded-2xl border border-[#E2EAE6] bg-white p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3"><div className="rounded-xl bg-[#E8F4F1] p-2 text-[#10706B]"><ShoppingCart size={18}/></div><div><h2 className="font-extrabold">{endpoint.label}</h2><p className="mt-1 text-xs text-[#7D8D89]">شناسه: <code>{endpoint.key}</code></p></div></div>
          <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={endpoint.enabled} onChange={e => update(index, { enabled: e.target.checked })} className="accent-[#10706B]"/> فعال</label>
        </div>
        <div className="grid gap-3 md:grid-cols-[150px_1fr]">
          <div><label className="mb-1 block text-xs font-bold text-[#60736E]">HTTP Method</label><select value={endpoint.method} onChange={e => update(index, { method: e.target.value as Endpoint["method"] })} className="w-full rounded-xl border border-[#DCE6E1] bg-white px-3 py-3 text-sm">{methods.map(method => <option key={method}>{method}</option>)}</select></div>
          <div><label className="mb-1 block text-xs font-bold text-[#60736E]">آدرس کامل endpoint</label><input dir="ltr" value={endpoint.url} onChange={e => update(index, { url: e.target.value })} placeholder="https://shop.example.com/api/cart/items" className="w-full rounded-xl border border-[#DCE6E1] px-3 py-3 text-left text-sm outline-none focus:border-[#10706B]"/></div>
        </div>
        {["POST", "PUT", "PATCH", "DELETE"].includes(endpoint.method) && <div className="mt-3"><label className="mb-1 block text-xs font-bold text-[#60736E]">نمونه Body / Payload (JSON)</label><textarea dir="ltr" rows={3} value={endpoint.payload} onChange={e => update(index, { payload: e.target.value })} placeholder='{"productId":"{{product.id}}","quantity":"{{quantity}}"}' className="w-full rounded-xl border border-[#DCE6E1] px-3 py-3 text-left font-mono text-xs outline-none focus:border-[#10706B]"/></div>}
      </section>)}
    </div>

    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
      <button onClick={() => void loadConfig(siteId)} disabled={!siteId || saving} className="rounded-xl border border-[#DCE6E1] bg-white px-5 py-3 text-sm font-bold">بازنشانی تغییرات</button>
      <button onClick={() => void save()} disabled={!siteId || saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#10706B] px-6 py-3 text-sm font-bold text-white disabled:opacity-50">{saving ? <LoaderCircle size={17} className="animate-spin"/> : <Save size={17}/>} ذخیره تنظیمات</button>
    </div>
    <p className="mt-5 text-xs leading-6 text-[#7D8D89]">این صفحه تنظیمات و نمونه قرارداد API را ذخیره می‌کند. اجرای واقعی عملیات سبد خرید از داخل مکالمه هوش مصنوعی به مرحله اتصال runtime و تست هر endpoint نیاز دارد؛ ذخیره این فرم به‌تنهایی به معنی اجرای سفارش واقعی نیست.</p>
  </CustomerShell>;
}
