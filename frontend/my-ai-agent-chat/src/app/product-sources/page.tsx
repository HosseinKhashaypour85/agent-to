"use client";

import { ChangeEvent, useState } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import CustomerShell from "@/components/CustomerShell";
import { api } from "@/lib/api";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CloudUpload,
  Database,
  FileJson,
  FileSpreadsheet,
  KeyRound,
  Link2,
  LoaderCircle,
  ShieldCheck,
  X,
} from "lucide-react";

type SourceType = "api" | "excel" | "json";
type ProductRow = Record<string, unknown>;
type ImportResult = {
  success?: boolean;
  message?: string;
  data?: { imported?: number; total?: number; source?: string };
};

const methods: {
  id: SourceType;
  title: string;
  description: string;
  icon: typeof Link2;
}[] = [
  {
    id: "api",
    title: "اتصال از طریق API",
    description: "دریافت محصولات از API فروشگاه و ذخیره در کاتالوگ",
    icon: Link2,
  },
  {
    id: "excel",
    title: "وارد کردن فایل اکسل",
    description: "ورود گروهی محصولات از فایل XLSX یا XLS",
    icon: FileSpreadsheet,
  },
  {
    id: "json",
    title: "وارد کردن فایل JSON",
    description: "ورود محصولات از آرایه JSON یا خروجی رایج APIها",
    icon: FileJson,
  },
];

function extractRows(value: unknown): ProductRow[] {
  if (Array.isArray(value)) return value.filter((row) => row && typeof row === "object") as ProductRow[];
  if (!value || typeof value !== "object") return [];
  const object = value as Record<string, unknown>;
  for (const key of ["products", "items", "results", "data"]) {
    const found = object[key];
    if (Array.isArray(found)) return found.filter((row) => row && typeof row === "object") as ProductRow[];
    if (found && typeof found === "object") {
      const nested = extractRows(found);
      if (nested.length) return nested;
    }
  }
  return [];
}

function normalizeFileRows(rows: ProductRow[]): ProductRow[] {
  const read = (row: ProductRow, keys: string[]) => {
    for (const key of keys) {
      const match = Object.keys(row).find((actual) => actual.trim().toLowerCase() === key.toLowerCase());
      if (match && row[match] !== "" && row[match] != null) return row[match];
    }
    return undefined;
  };
  return rows.map((row) => {
    const product: ProductRow = {
      name: String(read(row, ["name", "title", "product_name", "نام محصول", "نام"]) ?? "").trim(),
      rawData: row,
      source: "MANUAL",
      sourceType: "MANUAL",
    };
    const aliases: Record<string, string[]> = {
      externalId: ["externalId", "external_id", "id", "product_id", "شناسه"],
      sku: ["sku", "SKU", "code", "product_code", "کد محصول", "کد کالا"],
      description: ["description", "short_description", "توضیحات", "شرح"],
      category: ["category", "category_name", "دسته‌بندی", "دسته بندی"],
      imageUrl: ["imageUrl", "image_url", "image", "تصویر", "آدرس تصویر"],
      productUrl: ["productUrl", "product_url", "permalink", "url", "link", "آدرس محصول"],
      price: ["price", "regular_price", "قیمت"],
      compareAtPrice: ["compareAtPrice", "compare_at_price", "قیمت قبل"],
      stock: ["stock", "stock_quantity", "quantity", "موجودی", "تعداد"],
      currency: ["currency", "واحد پول"],
    };
    for (const [field, keys] of Object.entries(aliases)) {
      const value = read(row, keys);
      if (value === undefined) continue;
      if (["price", "compareAtPrice", "stock"].includes(field)) {
        const parsed = Number(String(value).replace(/[,٬\s]/g, ""));
        if (Number.isFinite(parsed)) product[field] = parsed;
      } else {
        product[field] = String(value).trim();
      }
    }
    if (typeof product.stock === "number") {
      product.stockStatus = product.stock <= 0 ? "OUT_OF_STOCK" : product.stock <= 5 ? "LOW_STOCK" : "IN_STOCK";
    }
    return product;
  });
}

export default function ProductSourcesPage() {
  const [source, setSource] = useState<SourceType>("api");
  const [apiUrl, setApiUrl] = useState("");
  const [authType, setAuthType] = useState("none");
  const [apiKeyHeader, setApiKeyHeader] = useState("x-api-key");
  const [token, setToken] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<ProductRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [fileInputKey, setFileInputKey] = useState(0);

  async function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
    setPreviewRows([]);
    setError("");
    setNotice("");
    if (!selected) return;
    if (selected.size > 5 * 1024 * 1024) {
      setFile(null);
      setError("حجم فایل نباید بیشتر از ۵ مگابایت باشد.");
      return;
    }
    try {
      let rows: ProductRow[] = [];
      if (source === "json") {
        const parsed: unknown = JSON.parse(await selected.text());
        rows = extractRows(parsed);
      } else {
        const buffer = await selected.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        rows = firstSheet ? XLSX.utils.sheet_to_json<ProductRow>(firstSheet, { defval: "" }) : [];
      }
      if (!rows.length) throw new Error("در فایل هیچ ردیف محصولی پیدا نشد.");
      if (rows.length > 2000) throw new Error("حداکثر ۲۰۰۰ محصول در هر بار قابل واردسازی است.");
      const normalized = normalizeFileRows(rows);
      const invalid = normalized.findIndex((row) => !String(row.name ?? "").trim());
      if (invalid !== -1) throw new Error(`نام محصول در ردیف ${invalid + 2} خالی است. عنوان ستون نام می‌تواند name یا نام محصول باشد.`);
      setPreviewRows(normalized);
    } catch (e) {
      setFile(null);
      setError(e instanceof Error ? e.message : "خواندن فایل ناموفق بود.");
    }
  }

  async function importSelectedSource() {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      let result: ImportResult;
      if (source === "api") {
        if (!apiUrl.trim()) throw new Error("آدرس API محصولات را وارد کن.");
        result = await api<ImportResult>("/agent/products/import", {
          method: "POST",
          body: JSON.stringify({
            mode: "api",
            url: apiUrl.trim(),
            authType,
            token: authType === "none" ? "" : token,
            apiKeyHeader,
          }),
        });
      } else {
        if (!file || !previewRows.length) throw new Error("ابتدا یک فایل معتبر انتخاب کن.");
        result = await api<ImportResult>("/agent/products/import", {
          method: "POST",
          body: JSON.stringify({
            mode: "file",
            source: source === "excel" ? "EXCEL" : "JSON",
            products: previewRows,
          }),
        });
      }
      const count = result.data?.imported ?? result.data?.total ?? previewRows.length;
      setNotice(`${new Intl.NumberFormat("fa-IR").format(count)} محصول با موفقیت وارد کاتالوگ شد.`);
      setFile(null);
      setPreviewRows([]);
      setToken("");
      setFileInputKey((key) => key + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "واردسازی محصولات ناموفق بود.");
    } finally {
      setBusy(false);
    }
  }

  function changeSource(next: SourceType) {
    setSource(next);
    setFile(null);
    setPreviewRows([]);
    setError("");
    setNotice("");
    setFileInputKey((key) => key + 1);
  }

  return (
    <CustomerShell>
      <div className="mb-7">
        <Link href="/customer-dashboard" className="mb-4 inline-flex items-center gap-2 text-xs font-semibold text-[#7D8D89] hover:text-[#10706B]">
          <ArrowRight size={15} /> بازگشت به داشبورد
        </Link>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-bold text-[#10706B]">کاتالوگ هوشمند / منابع</p>
            <h1 className="text-2xl font-black text-[#163633]">وارد کردن محصولات</h1>
            <p className="mt-2 text-sm text-[#7D8D89]">محصولات را از API، فایل اکسل یا JSON وارد کاتالوگ کسب‌وکارت کن.</p>
          </div>
          <span className="inline-flex items-center gap-2 self-start rounded-full border border-[#DCEAE6] bg-white px-3 py-2 text-xs text-[#6D7E79] sm:self-auto">
            <ShieldCheck size={15} className="text-[#10706B}" /> اتصال امن و محدود به حساب شما
          </span>
        </div>
      </div>

      {error && <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-800"><AlertCircle size={18} className="mt-1 shrink-0" /><span>{error}</span><button onClick={() => setError("")} aria-label="بستن خطا" className="mr-auto"><X size={16} /></button></div>}
      {notice && <div role="status" className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-800"><CheckCircle2 size={18} className="mt-1 shrink-0" /><span>{notice} <Link href="/product-catalog" className="font-bold underline">مشاهده کاتالوگ</Link></span></div>}

      <div className="grid gap-5 xl:grid-cols-[1fr_310px]">
        <section className="rounded-2xl border border-[#E4EBE8] bg-white p-5 sm:p-7">
          <h2 className="text-lg font-extrabold text-[#163633]">روش واردسازی را انتخاب کن</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {methods.map((method) => {
              const Icon = method.icon;
              const active = source === method.id;
              return <button key={method.id} type="button" onClick={() => changeSource(method.id)} className={`rounded-2xl border p-4 text-right transition ${active ? "border-[#10706B] bg-[#F0F8F5] ring-1 ring-[#10706B]/15" : "border-[#E5ECE9] hover:border-[#B8D5CE]"}`}>
                <span className={`mb-4 grid h-10 w-10 place-items-center rounded-xl ${active ? "bg-[#10706B] text-white" : "bg-[#F1F6F4] text-[#10706B]"}`}><Icon size={19} /></span>
                <b className="block text-sm text-[#163633]">{method.title}</b>
                <span className="mt-2 block text-xs leading-6 text-[#87938F]">{method.description}</span>
              </button>;
            })}
          </div>

          {source === "api" ? <div className="mt-7 space-y-4 border-t border-[#EDF1EF] pt-6">
            <div><h3 className="font-extrabold">تنظیم اتصال API</h3><p className="mt-1 text-xs leading-6 text-[#87938F]">آدرس باید HTTPS و پاسخ API باید JSON شامل فهرست محصولات باشد.</p></div>
            <label className="block"><span className="mb-2 block text-xs font-bold">آدرس API محصولات</span><input value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} dir="ltr" type="url" placeholder="https://shop.example.com/api/products" className="w-full rounded-xl border border-[#DDE6E2] px-4 py-3 text-left text-sm outline-none focus:border-[#10706B]" /></label>
            <label className="block"><span className="mb-2 block text-xs font-bold">روش احراز هویت</span><select value={authType} onChange={(e) => setAuthType(e.target.value)} className="w-full rounded-xl border border-[#DDE6E2] bg-white px-4 py-3 text-sm"><option value="none">بدون احراز هویت</option><option value="bearer">Bearer Token</option><option value="apiKey">API Key</option></select></label>
            {authType === "apiKey" && <label className="block"><span className="mb-2 block text-xs font-bold">نام هدر API Key</span><input value={apiKeyHeader} onChange={(e) => setApiKeyHeader(e.target.value)} dir="ltr" className="w-full rounded-xl border border-[#DDE6E2] px-4 py-3 text-left text-sm outline-none focus:border-[#10706B]" placeholder="x-api-key" /></label>}
            {authType !== "none" && <label className="block"><span className="mb-2 block text-xs font-bold">توکن دسترسی</span><div className="flex items-center gap-2 rounded-xl border border-[#DDE6E2] px-3"><KeyRound size={16} className="text-[#87938F]" /><input type="password" autoComplete="off" value={token} onChange={(e) => setToken(e.target.value)} className="w-full py-3 text-sm outline-none" placeholder="توکن API" /></div><span className="mt-1 block text-[11px] text-[#87938F]">توکن در کاتالوگ ذخیره نمی‌شود؛ فقط برای همین درخواست استفاده می‌شود.</span></label>}
          </div> : <div className="mt-7 border-t border-[#EDF1EF] pt-6">
            <h3 className="font-extrabold">{source === "excel" ? "انتخاب فایل اکسل" : "انتخاب فایل JSON"}</h3>
            <p className="mt-1 text-xs leading-6 text-[#87938F]">{source === "excel" ? "فرمت‌های XLSX و XLS پشتیبانی می‌شوند. ستون نام محصول الزامی است." : "فایل می‌تواند یک آرایه JSON یا شیئی با کلید products، items، results یا data باشد."}</p>
            <label className="mt-4 flex cursor-pointer flex-col items-center rounded-2xl border border-dashed border-[#B9D8CF] bg-[#F7FBF9] p-8 text-center hover:bg-[#F0F8F5]">
              <CloudUpload size={30} className="text-[#10706B]" />
              <b className="mt-3 text-sm">{file ? file.name : "فایل را انتخاب کن"}</b>
              <span className="mt-1 text-xs text-[#87938F]">حداکثر ۵ مگابایت · ۲۰۰۰ محصول در هر بار</span>
              <input key={fileInputKey} type="file" accept={source === "excel" ? ".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" : ".json,application/json"} onChange={(e) => void chooseFile(e)} className="mt-4 max-w-full text-xs" />
            </label>
            {previewRows.length > 0 && <div className="mt-4 rounded-xl border border-[#DDEBE6] bg-[#F8FBF9] p-4">
              <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2 text-sm font-bold text-[#10706B]"><CheckCircle2 size={17} /> فایل آماده واردسازی است</div><span className="text-xs text-[#667C75]">{new Intl.NumberFormat("fa-IR").format(previewRows.length)} محصول</span></div>
              <div className="mt-3 overflow-x-auto"><table className="w-full min-w-[360px] text-right text-xs"><thead><tr className="text-[#87938F]"><th className="px-2 py-2">نام محصول</th><th className="px-2 py-2">شناسه/SKU</th><th className="px-2 py-2">قیمت</th></tr></thead><tbody>{previewRows.slice(0, 5).map((row, index) => <tr key={index} className="border-t border-[#E5EEEA]"><td className="px-2 py-2 font-semibold">{String(row.name ?? "—")}</td><td className="px-2 py-2" dir="ltr">{String(row.sku ?? row.externalId ?? "—")}</td><td className="px-2 py-2">{row.price == null ? "—" : new Intl.NumberFormat("fa-IR").format(Number(row.price))}</td></tr>)}</tbody></table></div>
              {previewRows.length > 5 && <p className="mt-2 text-[11px] text-[#87938F]">پیش‌نمایش ۵ محصول اول است؛ همه ردیف‌های معتبر وارد می‌شوند.</p>}
            </div>}
          </div>}

          <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-[#EDF1EF] pt-5">
            <p className="max-w-lg text-xs leading-6 text-[#87938F]">محصولات به کاتالوگ همین حساب اضافه می‌شوند. اطلاعات حساب‌های دیگر قابل دسترسی نیست.</p>
            <button type="button" onClick={() => void importSelectedSource()} disabled={busy || (source === "api" ? !apiUrl.trim() : !file || previewRows.length === 0)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#10706B] px-5 py-3 text-sm font-bold text-white hover:bg-[#0D5D59] disabled:cursor-not-allowed disabled:opacity-50">
              {busy ? <LoaderCircle size={16} className="animate-spin" /> : <ArrowLeft size={16} />}
              {busy ? "در حال واردسازی..." : "وارد کردن محصولات"}
            </button>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-[#E4EBE8] bg-white p-5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#E8F4F0] text-[#10706B]"><ShieldCheck size={19} /></span>
            <h3 className="mt-4 font-extrabold">حریم خصوصی و امنیت</h3>
            <p className="mt-2 text-xs leading-6 text-[#7D8D89]">واردسازی با توکن حساب کاربری انجام می‌شود. توکن API منبع در رکورد محصولات ذخیره نمی‌شود و اتصال خارجی فقط از سمت سرور انجام می‌شود.</p>
          </div>
          <div className="rounded-2xl border border-[#E4EBE8] bg-white p-5">
            <h3 className="font-extrabold">قالب پیشنهادی فایل</h3>
            <p className="mt-2 text-xs leading-6 text-[#7D8D89]">حداقل ستون لازم: <code dir="ltr">name</code> یا «نام محصول». ستون‌های اختیاری: <code dir="ltr">sku</code>، <code dir="ltr">price</code>، <code dir="ltr">stock</code>، <code dir="ltr">category</code>، <code dir="ltr">description</code>، <code dir="ltr">imageUrl</code> و <code dir="ltr">productUrl</code>.</p>
          </div>
          <div className="rounded-2xl border border-[#E4EBE8] bg-white p-5">
            <h3 className="font-extrabold">مراحل واردسازی</h3>
            <div className="mt-4 space-y-4">{[{n:"۱",t:"انتخاب روش ورود"},{n:"۲",t:"اعتبارسنجی فایل یا API"},{n:"۳",t:"ذخیره محصولات در کاتالوگ"},{n:"۴",t:"بررسی در صفحه محصولات"}].map((item) => <div key={item.n} className="flex items-center gap-3"><span className="grid h-7 w-7 place-items-center rounded-lg bg-[#F0F6F4] text-xs font-bold text-[#10706B]">{item.n}</span><span className="text-xs font-semibold text-[#4D625D]">{item.t}</span></div>)}</div>
          </div>
          <Link href="/product-catalog" className="flex items-center justify-between rounded-xl border border-[#DCEAE6] bg-[#F3F9F6] px-4 py-3 text-sm font-bold text-[#10706B]">رفتن به کاتالوگ محصولات <Database size={16} /></Link>
        </aside>
      </div>
    </CustomerShell>
  );
}
