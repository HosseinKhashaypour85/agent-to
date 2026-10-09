"use client";

import { ChangeEvent, useState } from "react";
import Link from "next/link";
import CustomerShell from "@/components/CustomerShell";
import { api } from "@/lib/api";
import { ArrowRight, CircleAlert, Database, Link2, LoaderCircle, RefreshCw, ShieldCheck, DownloadCloud, CheckCircle2, FileSpreadsheet, Braces, ScanSearch, Upload, PlugZap } from "lucide-react";

type SourceMode = "discover" | "excel" | "api" | "json";
type ProductRow = Record<string, unknown> & { id?: string | number; title?: string; name?: string; description?: string; price?: number | string; category?: string; image?: string; imageUrl?: string; sku?: string; stock?: number | string; productUrl?: string };
const field = (row: ProductRow, keys: string[]) => {
  for (const key of keys) {
    const found = Object.entries(row).find(([name, value]) => name.toLowerCase() === key.toLowerCase() && value !== null && value !== undefined && value !== "");
    if (found) return found[1];
  }
  return undefined;
};
const productName = (row: ProductRow) => String(field(row, ["name", "title", "product_name", "productName", "نام محصول", "نام"]) ?? "").trim();
const numberValue = (value: unknown) => { if (typeof value === "number") return Number.isFinite(value) ? value : undefined; if (typeof value === "string" && value.trim()) { const n = Number(value.replace(/[,،\s]/g, "")); return Number.isFinite(n) ? n : undefined; } return undefined; };
function normalizeRows(value: unknown): ProductRow[] {
  if (Array.isArray(value)) return value.filter((x): x is ProductRow => !!x && typeof x === "object" && !Array.isArray(x) && !!productName(x as ProductRow));
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    for (const key of ["products", "data", "items", "results", "rows"]) { const rows = obj[key]; if (Array.isArray(rows)) return normalizeRows(rows); }
    if (productName(obj)) return [obj as ProductRow];
  }
  return [];
}
function parseCsv(text: string): ProductRow[] {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter(line => line.trim());
  if (lines.length < 2) throw new Error("فایل CSV باید ردیف عنوان ستون‌ها و حداقل یک محصول داشته باشد.");
  const delimiter = [",", ";", "\t"].sort((a,b) => lines[0].split(b).length - lines[0].split(a).length)[0];
  const parseLine = (line: string) => { const cells: string[] = []; let value = "", quoted = false; for (let i=0;i<line.length;i++) { const c=line[i]; if (c === '"' && quoted && line[i+1] === '"') { value+='"'; i++; } else if (c === '"') quoted=!quoted; else if (c === delimiter && !quoted) { cells.push(value.trim()); value=""; } else value+=c; } cells.push(value.trim()); return cells; };
  const headers = parseLine(lines[0]).map(h=>h.replace(/^\uFEFF/,""));
  return lines.slice(1).map(line => Object.fromEntries(parseLine(line).map((v,i)=>[headers[i] || `column_${i+1}`,v]))).filter(row=>productName(row));
}
async function parseXlsx(file: File): Promise<ProductRow[]> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let eocd = -1;
  for (let i=bytes.length-22;i>=Math.max(0,bytes.length-65558);i--) if (view.getUint32(i,true)===0x06054b50) { eocd=i; break; }
  if (eocd < 0) throw new Error("ساختار فایل Excel معتبر نیست.");
  const count=view.getUint16(eocd+10,true), centralOffset=view.getUint32(eocd+16,true);
  const entries = new Map<string,{method:number;start:number;compressed:number}>();
  let p=centralOffset;
  for(let i=0;i<count;i++){ if(view.getUint32(p,true)!==0x02014b50) break; const method=view.getUint16(p+10,true), compressed=view.getUint32(p+20,true), nameLen=view.getUint16(p+28,true), extraLen=view.getUint16(p+30,true), commentLen=view.getUint16(p+32,true), local=view.getUint32(p+42,true), name=new TextDecoder().decode(bytes.slice(p+46,p+46+nameLen)); const localName=view.getUint16(local+26,true), localExtra=view.getUint16(local+28,true); entries.set(name,{method,start:local+30+localName+localExtra,compressed}); p+=46+nameLen+extraLen+commentLen; }
  const readEntry=async(name:string)=>{const entry=entries.get(name); if(!entry) return ""; const data=bytes.slice(entry.start,entry.start+entry.compressed); if(entry.method===0) return new TextDecoder().decode(data); if(entry.method!==8) throw new Error("فشرده‌سازی این فایل Excel پشتیبانی نمی‌شود."); const stream=new Blob([data]).stream().pipeThrough(new DecompressionStream("deflate-raw" as CompressionFormat)); return await new Response(stream).text();};
  const sharedXml=await readEntry("xl/sharedStrings.xml");
  const shared=sharedXml ? Array.from(new DOMParser().parseFromString(sharedXml,"application/xml").getElementsByTagName("si")).map(si=>Array.from(si.getElementsByTagName("t")).map(t=>t.textContent||"").join("")) : [];
  const sheetName=[...entries.keys()].filter(n=>/^xl\/worksheets\/sheet\d+\.xml$/.test(n)).sort()[0];
  if(!sheetName) throw new Error("هیچ شیتی در فایل Excel پیدا نشد.");
  const xml=new DOMParser().parseFromString(await readEntry(sheetName),"application/xml");
  const rows=Array.from(xml.getElementsByTagName("row")).map(row=>Array.from(row.getElementsByTagName("c")).map(cell=>{const v=cell.getElementsByTagName("v")[0]?.textContent||""; return cell.getAttribute("t")==="s" ? shared[Number(v)]||"" : cell.getAttribute("t")==="inlineStr" ? Array.from(cell.getElementsByTagName("t")).map(t=>t.textContent||"").join("") : v;}));
  if(rows.length<2) throw new Error("فایل Excel باید شامل عنوان ستون‌ها و محصولات باشد.");
  const headers=rows[0].map((h,i)=>String(h||`column_${i+1}`).trim());
  return rows.slice(1).map(row=>Object.fromEntries(row.map((v,i)=>[headers[i],v]))).filter(row=>productName(row));
}
function getError(error: unknown) { return error instanceof Error ? error.message : "عملیات ناموفق بود."; }

export default function ProductSourcesPage() {
  const [mode,setMode]=useState<SourceMode>("discover");
  const [sourceName,setSourceName]=useState("منبع محصولات");
  const [url,setUrl]=useState("");
  const [auth,setAuth]=useState<"none"|"apiKey"|"bearer">("none");
  const [token,setToken]=useState("");
  const [products,setProducts]=useState<ProductRow[]>([]);
  const [fileName,setFileName]=useState("");
  const [tested,setTested]=useState(false);
  const [loading,setLoading]=useState(false);
  const [importing,setImporting]=useState(false);
  const [error,setError]=useState("");
  const [notice,setNotice]=useState("");

  function resetResults(){setProducts([]);setTested(false);setError("");setNotice("");}
  async function handleFile(event:ChangeEvent<HTMLInputElement>){
    const file=event.target.files?.[0]; if(!file)return; resetResults();setLoading(true);setFileName(file.name);
    try { const ext=file.name.split(".").pop()?.toLowerCase(); let rows:ProductRow[]; if(ext==="json"){rows=normalizeRows(JSON.parse(await file.text()));}else if(ext==="csv"||ext==="tsv"){rows=parseCsv(await file.text());}else if(ext==="xlsx"){rows=await parseXlsx(file);}else{throw new Error("فرمت فایل پشتیبانی نمی‌شود. فایل XLSX، CSV یا JSON انتخاب کن.");}
      if(!rows.length)throw new Error("محصولی پیدا نشد. ستون نام باید شامل name یا title یا نام محصول باشد.");setProducts(rows);setTested(true);setNotice(`${rows.length} محصول از فایل خوانده شد؛ قبل از ذخیره پیش‌نمایش را بررسی کن.`);
    }catch(e){setError(getError(e));}finally{setLoading(false);event.target.value="";}
  }
  async function testApi(){
    setError("");setNotice("");setTested(false);setLoading(true);
    try {const parsed=new URL(url.trim());if(!["https:","http:"].includes(parsed.protocol))throw new Error("آدرس API معتبر نیست.");const headers:Record<string,string>={Accept:"application/json"};if(auth==="bearer"&&token.trim())headers.Authorization=`Bearer ${token.trim()}`;if(auth==="apiKey"&&token.trim())headers["x-api-key"]=token.trim();
      const response=await fetch(parsed.toString(),{headers,cache:"no-store"});if(!response.ok)throw new Error(`API پاسخ ${response.status} برگرداند.`);const rows=normalizeRows(await response.json());if(!rows.length)throw new Error("محصولی در پاسخ API پیدا نشد؛ ساختار آرایه یا products/data/items را بررسی کن.");setProducts(rows);setTested(true);setNotice(`اتصال موفق بود؛ ${rows.length} محصول دریافت شد.`);
    }catch(e){setProducts([]);setError(`${getError(e)} اگر خطای CORS می‌بینی، API باید از سمت سرور خوانده شود یا CORS را فعال کنی.`);}finally{setLoading(false);}
  }
  async function discover(){
    setError("");setNotice("");setLoading(true);setTested(false);
    try {const parsed=new URL(url.trim());if(!["https:","http:"].includes(parsed.protocol))throw new Error("آدرس سایت معتبر نیست.");const response=await fetch(parsed.toString(),{cache:"no-store"});if(!response.ok)throw new Error(`سایت پاسخ ${response.status} برگرداند.`);const html=await response.text();const doc=new DOMParser().parseFromString(html,"text/html");const rows:ProductRow[]=[];
      for(const node of Array.from(doc.querySelectorAll('script[type="application/ld+json"]'))){try{const data=JSON.parse(node.textContent||"null");const visit=(x:unknown)=>{if(Array.isArray(x)){x.forEach(visit);return;}if(!x||typeof x!=="object")return;const o=x as Record<string,unknown>;const type=String(o["@type"]||"");if(type==="Product"||type.includes("Product")){const offer=(Array.isArray(o.offers)?o.offers[0]:o.offers) as Record<string,unknown>|undefined;rows.push({id:String(o.sku||o.productID||rows.length+1),name:String(o.name||""),description:String(o.description||""),price:numberValue(offer?.price),currency:String(offer?.priceCurrency||"IRR"),image:Array.isArray(o.image)?String(o.image[0]):String(o.image||""),productUrl:String(o.url||parsed.toString()),sku:String(o.sku||"")});}if(o["@graph"])visit(o["@graph"]);};visit(data);}catch{}}
      if(!rows.length)throw new Error("محصول ساختاریافته‌ای در این صفحه پیدا نشد. صفحه اصلی برای تشخیص کافی نیست؛ URL صفحه محصول یا API محصولات را وارد کن. بعضی سایت‌ها نیز دسترسی مرورگر را با CORS محدود می‌کنند.");setProducts(rows);setTested(true);setNotice(`${rows.length} محصول از داده‌های ساختاریافته صفحه شناسایی شد.`);
    }catch(e){setError(getError(e));}finally{setLoading(false);}
  }
  async function importProducts(){
    setError("");setNotice("");setImporting(true);let imported=0;const failures:string[]=[];
    try{for(const [index,p] of products.entries()){const name=productName(p);try{const price=numberValue(field(p,["price","regular_price","sale_price","قیمت"]));const stock=numberValue(field(p,["stock","quantity","inventory","موجودی"]));const image=field(p,["imageUrl","image_url","image","images","تصویر"]);const id=field(p,["id","externalId","external_id","sku","کد محصول"])??`${Date.now()}-${index}`;const payload={externalId:String(id),name,description:String(field(p,["description","body_html","توضیحات"])??""),price,currency:String(field(p,["currency","priceCurrency"])??"IRR"),category:String(field(p,["category","product_type","دسته‌بندی"])??""),imageUrl:Array.isArray(image)?String(image[0]??""):String(image??""),productUrl:String(field(p,["productUrl","url","permalink","لینک محصول"])??""),sku:String(field(p,["sku","code","کد"])??`IMPORT-${id}`),stock,source:mode==="api"?"CUSTOM_API":"MANUAL",sourceType:mode==="api"?"CUSTOM_API":"MANUAL",rawData:p,isActive:true};await api("/agent/products",{method:"POST",body:JSON.stringify(payload)});imported++;}catch(e){failures.push(`${name||index+1}: ${getError(e)}`);}}
      setNotice(`${imported} محصول از ${products.length} محصول وارد کاتالوگ شد.`);if(failures.length)setError(`${failures.length} محصول ذخیره نشد. ${failures.slice(0,2).join(" | ")}`);
    }finally{setImporting(false);}
  }
  const tabs:[SourceMode,string,string][]=[["discover","تشخیص خودکار","بررسی سایت مشتری"],["excel","اکسل و CSV","XLSX، CSV، TSV"],["api","API محصولات","اتصال و همگام‌سازی"],["json","فایل JSON","آپلود فایل JSON"]];
  return <CustomerShell>
    <div className="mb-7"><Link href="/customer-dashboard" className="mb-4 inline-flex items-center gap-2 text-xs font-semibold text-[#7D8D89] hover:text-[#10706B]"><ArrowRight size={15}/> بازگشت به داشبورد</Link><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="mb-2 text-xs font-bold text-[#10706B]">کاتالوگ هوشمند / منابع</p><h1 className="text-2xl font-black">منابع محصولات</h1><p className="mt-2 text-sm text-[#7D8D89]">محصولات سایتت را خودکار شناسایی کن یا از فایل، JSON و API وارد کاتالوگ کن.</p></div><span className="inline-flex items-center gap-2 rounded-full border border-[#DCEAE6] bg-white px-3 py-2 text-xs text-[#6D7E79]"><ShieldCheck size={15} className="text-[#10706B]"/> کاتالوگ اختصاصی مشتری</span></div></div>
    <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{tabs.map(([id,title,sub])=><button key={id} onClick={()=>{setMode(id);resetResults();}} className={`rounded-2xl border p-4 text-right transition ${mode===id?"border-[#10706B] bg-[#EAF5F1]":"border-[#E4EBE8] bg-white hover:border-[#BFDCD3]"}`}><span className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-white text-[#10706B]">{id==="discover"?<ScanSearch size={19}/>:id==="excel"?<FileSpreadsheet size={19}/>:id==="api"?<PlugZap size={19}/>:<Braces size={19}/>}</span><span className="block text-sm font-extrabold">{title}</span><span className="mt-1 block text-xs text-[#7D8D89]">{sub}</span></button>)}</div>
    <div className="grid gap-5 xl:grid-cols-[1fr_300px]"><section className="rounded-2xl border border-[#E4EBE8] bg-white p-5 sm:p-7">
      <label className="mb-5 block"><span className="mb-2 block text-xs font-bold">نام منبع</span><input value={sourceName} onChange={e=>setSourceName(e.target.value)} className="w-full rounded-xl border border-[#DDE6E2] px-4 py-3 text-sm outline-none focus:border-[#10706B]" placeholder="مثلاً فروشگاه اصلی"/></label>
      {(mode==="discover"||mode==="api")&&<div className="space-y-4"><label className="block"><span className="mb-2 block text-xs font-bold">{mode==="discover"?"آدرس سایت مشتری":"آدرس API محصولات"}</span><input dir="ltr" value={url} onChange={e=>{setUrl(e.target.value);resetResults();}} className="w-full rounded-xl border border-[#DDE6E2] px-4 py-3 text-left text-sm outline-none focus:border-[#10706B]" placeholder={mode==="discover"?"https://example.com": "https://example.com/api/products"} type="url"/></label>{mode==="api"&&<><label className="block"><span className="mb-2 block text-xs font-bold">روش احراز هویت</span><select value={auth} onChange={e=>setAuth(e.target.value as typeof auth)} className="w-full rounded-xl border border-[#DDE6E2] bg-white px-4 py-3 text-sm"><option value="none">بدون احراز هویت</option><option value="apiKey">API Key (x-api-key)</option><option value="bearer">Bearer Token</option></select></label>{auth!=="none"&&<label className="block"><span className="mb-2 block text-xs font-bold">کلید دسترسی</span><input type="password" value={token} onChange={e=>setToken(e.target.value)} className="w-full rounded-xl border border-[#DDE6E2] px-4 py-3 text-sm" autoComplete="off" placeholder="کلید API"/></label>}</>}</div>}
      {(mode==="excel"||mode==="json")&&<label className="flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-[#BFDCD3] bg-[#F8FBF9] px-5 py-10 text-center"><Upload size={30} className="mb-3 text-[#10706B]"/><span className="font-extrabold">{fileName|| (mode==="json"?"فایل JSON را انتخاب کن":"فایل Excel یا CSV را انتخاب کن")}</span><span className="mt-2 text-xs text-[#7D8D89]">{mode==="json"?"فرمت .json":"فرمت‌های .xlsx، .csv و .tsv"}</span><input type="file" accept={mode==="json"?".json,application/json":".xlsx,.csv,.tsv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"} className="mt-4 block max-w-full text-xs" onChange={e=>void handleFile(e)}/></label>}
      <div className="mt-6 flex flex-wrap gap-3">{(mode==="discover"||mode==="api")&&<button onClick={()=>void(mode==="discover"?discover():testApi())} disabled={loading||!url.trim()} className="inline-flex items-center gap-2 rounded-xl bg-[#10706B] px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{loading?<LoaderCircle size={16} className="animate-spin"/>:<RefreshCw size={16}/>} {loading?"در حال بررسی...":mode==="discover"?"شناسایی محصولات سایت":"تست اتصال و دریافت محصولات"}</button>}{tested&&products.length>0&&<button onClick={()=>void importProducts()} disabled={importing} className="inline-flex items-center gap-2 rounded-xl border border-[#BFDCD3] px-5 py-3 text-sm font-bold text-[#10706B] disabled:opacity-60">{importing?<LoaderCircle size={16} className="animate-spin"/>:<DownloadCloud size={16}/>} {importing?"در حال ذخیره...":"وارد کردن به کاتالوگ"}</button>}</div>
      {error&&<p role="alert" className="mt-4 flex items-start gap-2 rounded-xl bg-[#FFF1F1] p-3 text-xs leading-6 text-[#A62B2B]"><CircleAlert size={15} className="mt-1 shrink-0"/>{error}</p>}{notice&&<p role="status" className="mt-4 flex items-start gap-2 rounded-xl bg-[#EFF9F4] p-3 text-xs leading-6 text-[#176B4D]"><CheckCircle2 size={15} className="mt-1 shrink-0"/>{notice}</p>}
      {tested&&<div className="mt-6"><div className="mb-3 flex items-center justify-between"><h3 className="font-extrabold">پیش‌نمایش محصولات</h3><span className="rounded-full bg-[#E8F4F0] px-3 py-1 text-xs font-bold text-[#10706B]">{products.length} محصول</span></div><div className="overflow-x-auto rounded-xl border border-[#E4EBE8]"><table className="w-full min-w-[600px] text-right text-xs"><thead className="bg-[#F7FAF8] text-[#7D8D89]"><tr><th className="px-4 py-3">محصول</th><th className="px-4 py-3">شناسه</th><th className="px-4 py-3">دسته‌بندی</th><th className="px-4 py-3">قیمت</th></tr></thead><tbody>{products.slice(0,100).map((p,i)=><tr key={String(field(p,["id","sku"])??i)} className="border-t border-[#EDF1EF]"><td className="px-4 py-3 font-bold">{productName(p)}</td><td dir="ltr" className="px-4 py-3">{String(field(p,["id","sku","externalId"])??"—")}</td><td className="px-4 py-3">{String(field(p,["category","product_type","دسته‌بندی"])??"—")}</td><td className="px-4 py-3 whitespace-nowrap">{numberValue(field(p,["price","regular_price","قیمت"]))?.toLocaleString("fa-IR")??"—"}</td></tr>)}</tbody></table>{products.length>100&&<p className="p-3 text-xs text-[#7D8D89]">۱۰۰ محصول اول نمایش داده شده‌اند؛ همه محصولات وارد می‌شوند.</p>}</div></div>}
    </section><aside className="space-y-4"><div className="rounded-2xl border border-[#E4EBE8] bg-white p-5"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#E8F4F0] text-[#10706B]"><Database size={19}/></span><h3 className="mt-4 font-extrabold">یک کاتالوگ، چند منبع</h3><p className="mt-2 text-xs leading-6 text-[#7D8D89]">محصولات هر روش در کاتالوگ حساب مشتری ذخیره می‌شوند. نام، قیمت، تصویر، شناسه و موجودی تا جای ممکن به فیلدهای استاندارد تبدیل می‌شوند.</p></div><div className="rounded-2xl border border-[#E4EBE8] bg-white p-5"><h3 className="font-extrabold">قالب پیشنهادی فایل</h3><p className="mt-2 text-xs leading-6 text-[#7D8D89]">برای اکسل و CSV ستون‌های name یا title، price، description، sku، category، imageUrl و stock را قرار بده. JSON می‌تواند آرایه مستقیم یا کلیدهای products، data، items یا results داشته باشد.</p></div><div className="rounded-2xl border border-[#F1DDB2] bg-[#FFFBF2] p-5"><h3 className="font-extrabold text-[#8A5A11]">نکته‌ی تشخیص خودکار</h3><p className="mt-2 text-xs leading-6 text-[#8A6A37]">شناسایی از داده‌های ساختاریافته Product در صفحه انجام می‌شود. اگر سایت این داده‌ها را نداشته باشد یا CORS محدود باشد، باید API یا فایل محصولات را استفاده کنی. این مرحله هنوز خزنده‌ی کامل فروشگاه نیست.</p></div></aside></div>
  </CustomerShell>;
}
