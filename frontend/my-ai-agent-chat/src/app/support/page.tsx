"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

import { formatDate , priorityLabel, statusLabel, supportRequest, Ticket, TicketPriority, TicketStatus } from "@/lib/support-api";
const statuses: TicketStatus[] = ["OPEN", "IN_PROGRESS", "WAITING_CUSTOMER", "ANSWERED", "CLOSED"];
const priorities: TicketPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const box: React.CSSProperties = { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: 18 };
const input: React.CSSProperties = { padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 9, background: "white", color: "#111827", width: "100%" };
const btn: React.CSSProperties = { border: 0, borderRadius: 9, padding: "10px 14px", background: "#10706B", color: "white", fontWeight: 700, cursor: "pointer" };

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [search, setSearch] = useState("");
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (priorityFilter) params.set("priority", priorityFilter);
      if (search.trim()) params.set("search", search.trim());
      const data = await supportRequest<{ tickets: Ticket[] }>(`/admin/support${params.size ? `?${params.toString()}` : ""}`);
      setTickets(data.tickets || []);
    } catch (e) { setError(e instanceof Error ? e.message : "دریافت تیکت‌ها ناموفق بود"); }
  }, [statusFilter, priorityFilter, search]);
  useEffect(() => { void load(); }, [load]);

  async function selectTicket(ticket: Ticket) {
    setError(""); setNotice("");
    try { const data = await supportRequest<{ ticket: Ticket }>(`/admin/support/${ticket.id}`); setSelected(data.ticket); }
    catch (e) { setError(e instanceof Error ? e.message : "دریافت تیکت ناموفق بود"); }
  }

  async function sendReply(e: FormEvent) {
    e.preventDefault(); if (!selected || !reply.trim()) return;
    setBusy(true); setError(""); setNotice("");
    try { const data = await supportRequest<{ ticket: Ticket }>(`/admin/support/${selected.id}/messages`, { method: "POST", body: JSON.stringify({ message: reply }) }); setSelected(data.ticket); setReply(""); setNotice("پاسخ ارسال شد."); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : "ارسال پاسخ ناموفق بود"); }
    finally { setBusy(false); }
  }

  async function updateTicket(values: { status?: TicketStatus; priority?: TicketPriority }) {
    if (!selected) return; setBusy(true); setError(""); setNotice("");
    try { const data = await supportRequest<{ ticket: Ticket }>(`/admin/support/${selected.id}`, { method: "PATCH", body: JSON.stringify(values) }); setSelected(data.ticket); setNotice("تغییرات ذخیره شد."); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : "به‌روزرسانی ناموفق بود"); }
    finally { setBusy(false); }
  }

  return <main dir="rtl" style={{ minHeight: "100vh", background: "#f6f8fa", color: "#111827", padding: "28px 16px", fontFamily: "Tahoma, Arial, sans-serif" }}><div style={{ maxWidth: 1400, margin: "0 auto" }}>
    <header style={{ marginBottom: 24 }}><div style={{ color: "#10706B", fontSize: 13, fontWeight: 800 }}>AGENT-TO / ADMIN</div><h1 style={{ margin: "8px 0", fontSize: 28 }}>مدیریت تیکت‌های پشتیبانی</h1><p style={{ color: "#6b7280", margin: 0 }}>درخواست‌های مشتریان را بررسی کن، پاسخ بده و وضعیت را تغییر بده.</p></header>
    {error && <div style={{ ...box, color: "#b91c1c", borderColor: "#fecaca", marginBottom: 14 }}>{error}</div>}{notice && <div style={{ ...box, color: "#047857", borderColor: "#a7f3d0", marginBottom: 14 }}>{notice}</div>}
    <section style={{ ...box, marginBottom: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10 }}>
      <input aria-label="جستجو" value={search} onChange={e => setSearch(e.target.value)} placeholder="جستجو در موضوع، شناسه یا Tenant ID" style={input} />
      <select aria-label="فیلتر وضعیت" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={input}><option value="">همه وضعیت‌ها</option>{statuses.map(s => <option key={s} value={s}>{statusLabel[s]}</option>)}</select>
      <select aria-label="فیلتر اولویت" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} style={input}><option value="">همه اولویت‌ها</option>{priorities.map(p => <option key={p} value={p}>{priorityLabel[p]}</option>)}</select>
      <button onClick={() => void load()} style={btn}>بروزرسانی</button>
    </section>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,390px),1fr))", gap: 16, alignItems: "start" }}>
      <section style={box}><h2 style={{ margin: "0 0 14px", fontSize: 18 }}>فهرست تیکت‌ها <span style={{ color: "#6b7280", fontSize: 13 }}>({tickets.length})</span></h2>{tickets.length === 0 ? <p style={{ color: "#6b7280" }}>تیکتی پیدا نشد.</p> : <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", minWidth: 360 }}><thead><tr style={{ textAlign: "right", color: "#6b7280", fontSize: 12 }}><th style={{ padding: 9 }}>موضوع</th><th style={{ padding: 9 }}>وضعیت</th><th style={{ padding: 9 }}>آخرین پیام</th></tr></thead><tbody>{tickets.map(t => <tr key={t.id} onClick={() => void selectTicket(t)} style={{ cursor: "pointer", background: selected?.id === t.id ? "#f0fdfa" : "transparent", borderTop: "1px solid #e5e7eb" }}><td style={{ padding: 10 }}><strong style={{ display: "block", fontSize: 13 }}>{t.subject}</strong><small style={{ color: "#6b7280" }}>{t.tenantId}</small></td><td style={{ padding: 10, whiteSpace: "nowrap", fontSize: 12 }}>{statusLabel[t.status]}</td><td style={{ padding: 10, whiteSpace: "nowrap", fontSize: 11, color: "#6b7280" }}>{formatDate(t.lastMessageAt)}</td></tr>)}</tbody></table></div>}</section>
      <section style={box}><h2 style={{ margin: "0 0 6px", fontSize: 18 }}>{selected ? selected.subject : "جزئیات تیکت"}</h2>{selected ? <><div style={{ fontSize: 12, color: "#6b7280", marginBottom: 14 }}>شناسه: {selected.id}<br/>مشتری/تِننت: {selected.tenantId}<br/>ثبت: {formatDate(selected.createdAt)}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}><label style={{ fontSize: 12 }}>وضعیت<select disabled={busy} value={selected.status} onChange={e => void updateTicket({ status: e.target.value as TicketStatus })} style={{ ...input, marginTop: 6 }}>{statuses.map(s => <option key={s} value={s}>{statusLabel[s]}</option>)}</select></label><label style={{ fontSize: 12 }}>اولویت<select disabled={busy} value={selected.priority} onChange={e => void updateTicket({ priority: e.target.value as TicketPriority })} style={{ ...input, marginTop: 6 }}>{priorities.map(p => <option key={p} value={p}>{priorityLabel[p]}</option>)}</select></label></div>
        <div style={{ display: "grid", gap: 10, marginBottom: 18 }}>{(selected.messages || []).map(m => <div key={m.id} style={{ justifySelf: m.senderType === "SUPPORT" ? "end" : "start", maxWidth: "92%", background: m.senderType === "SUPPORT" ? "#e6f4f1" : "#f3f4f6", borderRadius: 12, padding: 12 }}><div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6 }}>{m.senderType === "SUPPORT" ? "پشتیبانی" : "مشتری"} · {formatDate(m.createdAt)}</div><div style={{ whiteSpace: "pre-wrap", lineHeight: 1.8, overflowWrap: "anywhere" }}>{m.message}</div></div>)}</div>
        {selected.status === "CLOSED" ? <p style={{ color: "#b91c1c" }}>تیکت بسته شده است. برای پاسخ‌گویی ابتدا وضعیت را تغییر بده.</p> : <form onSubmit={sendReply} style={{ display: "grid", gap: 10 }}><textarea required maxLength={10000} rows={4} value={reply} onChange={e => setReply(e.target.value)} placeholder="پاسخ تیم پشتیبانی…" style={{ ...input, resize: "vertical" }} /><button disabled={busy} style={{ ...btn, justifySelf: "start", opacity: busy ? .6 : 1 }}>{busy ? "در حال ارسال…" : "ارسال پاسخ"}</button></form>}</> : <p style={{ color: "#6b7280", lineHeight: 1.9 }}>برای مشاهده مکالمه و مدیریت وضعیت، یک تیکت از فهرست انتخاب کن.</p>}</section>
    </div>
  </div></main>;
}
