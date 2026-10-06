"use client";
import { useEffect,useState } from "react";
import Shell from "@/components/Shell";
import PageHeader from "@/components/PageHeader";
import { api } from "@/lib/api";
import { Check, Plus } from "lucide-react";

type Plan={id:string;name:string;slug:string;description?:string;price:number|string;currency:string;billingInterval:string;maxCustomers:number;maxLeads:number;maxProducts:number;maxAiMessages:number;isPopular:boolean;status:string};
export default function Plans(){
 const [items,setItems]=useState<Plan[]>([]); const [loading,setLoading]=useState(true);
 useEffect(()=>{api<{success:boolean;data:Plan[]}>("/admin/plans").then(r=>setItems(r.data||[])).finally(()=>setLoading(false))},[]);
 return <Shell><PageHeader title="پلن‌ها" description="مدیریت پلن‌های اشتراکی AGENT-TO" action={<button className="h-11 px-4 rounded-xl bg-brand-600 text-white text-sm font-bold flex gap-2 items-center"><Plus size={18}/> پلن جدید</button>}/>
 {loading?<div className="card p-12 text-center text-slate-400">در حال بارگذاری...</div>:<div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">{items.map(p=><div className={`card p-6 relative ${p.isPopular?"ring-2 ring-brand-600/20":""}`} key={p.id}>{p.isPopular&&<span className="absolute left-5 top-5 bg-brand-50 text-brand-700 text-[11px] font-bold px-2.5 py-1 rounded-full">محبوب‌ترین</span>}<div className="text-lg font-black">{p.name}</div><div className="text-sm text-slate-400 mt-1">{p.description}</div><div className="mt-5"><b className="text-3xl">${p.price}</b><span className="text-slate-400 text-sm"> / {p.billingInterval==="MONTHLY"?"ماه":"سال"}</span></div><div className="mt-6 space-y-3 text-sm">{[`${p.maxCustomers.toLocaleString()} مشتری`,`${p.maxLeads.toLocaleString()} لید`,`${p.maxProducts.toLocaleString()} محصول`,`${p.maxAiMessages.toLocaleString()} پیام AI`].map(f=><div key={f} className="flex items-center gap-2"><Check size={16} className="text-brand-600"/>{f}</div>)}</div><button className="mt-6 w-full h-11 rounded-xl border border-slate-200 text-sm font-bold hover:border-brand-600">مدیریت پلن</button></div>)}</div>}</Shell>
}
