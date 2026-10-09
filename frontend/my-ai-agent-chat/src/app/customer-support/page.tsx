"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { formatDate, priorityLabel, statusLabel, supportRequest, Ticket, TicketPriority, TicketStatus } from "../../../lib/support-api";

const panel: React.CSSProperties = { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 20 };
const field: React.CSSProperties = { width: "100%", padding: "12px 14px", border: "1px solid #d1d5db", borderRadius: 10, background: "#fff", color: "#111827", outlineColor: "#10706B" };
const button: React.CSSProperties = { border: 0, borderRadius: 10, padding: "11px 16px", background: "#10706B", color: "white", cursor: "pointer", fontWeight: 700 };

export default function CustomerSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [priority, setPriority] = useState<TicketPriority>("MEDIUM");
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadTickets = useCallback(async () => {
    try {
      const data = await supportRequest<{ tickets: Ticket[] }>("/support/tickets");
      setTickets(data.tickets || []);
    } catch (e) { setError(e instanceof Error ? e.message : "دریافت تیکت‌ها ناموفق بود"); }
  }, []);

  useEffect(() => { void loadTickets(); }, [loadTickets]);

  async function openTicket(ticket: Ticket) {
    setError("");
    try {
      const data = await supportRequest<{ ticket: Ticket }>(`/support/tickets/${ticket.id}`);
      setSelected(data.ticket);
    } catch (e) { setError(e instanceof Error ? e.message : "دریافت جزئیات ناموفق بود"); }
  }

  async function createTicket(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      const data = await supportRequest<{ ticket: Ticket }>("/support/tickets", { method: "POST", body: JSON.stringify({ subject, category, priority, message }) });
      setTickets((old) => [data.ticket, ...old]); setSelected(data.ticket); setShowNew(false);
      setSubject(""); setMessage(""); setNotice("تیکت با موفقیت ثبت شد."); await loadTickets();
    } catch (e) { setError(e instanceof Error ? e.message : "ثبت تیکت ناموفق بود"); }
    finally { setBusy(false); }
  }

  async function sendReply(e: FormEvent) {
    e.preventDefault(); if (!selected || !reply.trim()) return;
    setBusy(true); setError("");
    try {
      const data = await supportRequest<{ ticket: Ticket }>(`/support/tickets/${selected.id}/messages`, { method: "POST", body: JSON.stringify({ message: reply }) });
      setSelected(data.ticket); setReply(""); await loadTickets();
    } catch (e) { setError(e instanceof Error ? e.message : "ارسال پیام ناموفق بود"); }
    finally { setBusy(false); }
  }

  return <main dir="rtl" style={{ minHeight: "100vh", background: "#f6f8fa", color: "#111827", padding: "28px 16px", fontFamily: "Tahoma, Arial, sans-serif" }}>
    <div style={{ maxWidth: 1180, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
        <div><div style={{ color: "#10706B", fontSize: 13, fontWeight: 800 }}>AGENT-TO</div><h1 style={{ margin: "8px 0", fontSize: 28 }}>پشتیبانی و تیکت‌ها</h1><p style={{ margin: 0, color: "#6b7280" }}>درخواستت رو ثبت کن و پاسخ تیم پشتیبانی رو همین‌جا دریافت کن.</p></div>
        <button style={button} onClick={() => { setShowNew(!showNew); setNotice(""); }}>＋ ثبت تیکت جدید</button>
      </header>
      {error && <div role="alert" style={{ ...panel, borderColor: "#fecaca", color: "#b91c1c", marginBottom: 16 }}>{error}</div>}
      {notice && <div style={{ ...panel, borderColor: "#a7f3d0", color: "#047857", marginBottom: 16 }}>{notice}</div>}
      {showNew && <form onSubmit={createTicket} style={{ ...panel, marginBottom: 20, display: "grid", gap: 14 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>ایجاد درخواست جدید</h2>
        <label>موضوع<input required maxLength={191} value={subject} onChange={e => setSubject(e.target.value)} style={{ ...field, marginTop: 7 }} placeholder="مثلاً مشکل در اتصال عامل هوش مصنوعی" /></label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
          <label>دسته‌بندی<select value={category} onChange={e => setCategory(e.target.value)} style={{ ...field, marginTop: 7 }}><option value="GENERAL">عمومی</option><option value="TECHNICAL">فنی</option><option value="BILLING">مالی و پرداخت</option><option value="ACCOUNT">حساب کاربری</option></select></label>
          <label>اولویت<select value={priority} onChange={e => setPriority(e.target.value as TicketPriority)} style={{ ...field, marginTop: 7 }}><option value="LOW">کم</option><option value="MEDIUM">متوسط</option><option value="HIGH">زیاد</option><option value="URGENT">فوری</option></select></label>
        </div>
        <label>شرح درخواست<textarea required maxLength={10000} rows={4} value={message} onChange={e => setMessage(e.target.value)} style={{ ...field, marginTop: 7, resize: "vertical" }} placeholder="مشکل یا درخواستت رو توضیح بده..." /></label>
        <div style={{ display: "flex", gap: 10 }}><button disabled={busy} style={{ ...button, opacity: busy ? .6 : 1 }}>{busy ? "در حال ثبت…" : "ثبت تیکت"}</button><button type="button" onClick={() => setShowNew(false)} style={{ ...button, background: "#e5e7eb", color: "#374151" }}>انصراف</button></div>
      </form>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,340px),1fr))", gap: 18, alignItems: "start" }}>
        <section style={panel}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}><h2 style={{ fontSize: 18, margin: 0 }}>درخواست‌های من</h2><span style={{ color: "#6b7280", fontSize: 13 }}>{tickets.length} تیکت</span></div>
          {!tickets.length ? <p style={{ color: "#6b7280", lineHeight: 1.9 }}>هنوز تیکتی ثبت نکردی.</p> : tickets.map(t => <button key={t.id} onClick={() => void openTicket(t)} style={{ width: "100%", textAlign: "right", padding: 14, marginBottom: 9, border: `1px solid ${selected?.id === t.id ? "#10706B" : "#e5e7eb"}`, borderRadius: 12, background: selected?.id === t.id ? "#f0fdfa" : "white", cursor: "pointer", color: "#111827" }}><strong style={{ display: "block", marginBottom: 8 }}>{t.subject}</strong><span style={{ color: "#6b7280", fontSize: 12 }}>{statusLabel[t.status as TicketStatus] || t.status} · اولویت {priorityLabel[t.priority] || t.priority}</span><span style={{ display: "block", marginTop: 7, fontSize: 11, color: "#9ca3af" }}>{formatDate(t.lastMessageAt)}</span></button>)}</section>
        <section style={panel}><h2 style={{ fontSize: 18, margin: "0 0 6px" }}>{selected ? selected.subject : "گفت‌وگوی تیکت"}</h2>{selected ? <><div style={{ color: "#6b7280", fontSize: 12, marginBottom: 18 }}>وضعیت: {statusLabel[selected.status]} · اولویت: {priorityLabel[selected.priority]}</div><div style={{ display: "grid", gap: 10, marginBottom: 18 }}>
          {(selected.messages || []).map(m => <div key={m.id} style={{ justifySelf: m.senderType === "CUSTOMER" ? "start" : "end", maxWidth: "90%", background: m.senderType === "CUSTOMER" ? "#f3f4f6" : "#e6f4f1", borderRadius: 12, padding: 12 }}><div style={{ fontSize: 11, color: "#6b7280", marginBottom: 7 }}>{m.senderType === "CUSTOMER" ? "شما" : "تیم پشتیبانی"} · {formatDate(m.createdAt)}</div><div style={{ whiteSpace: "pre-wrap", lineHeight: 1.8, overflowWrap: "anywhere" }}>{m.message}</div></div>)}
        </div>{selected.status === "CLOSED" ? <p style={{ color: "#b91c1c" }}>این تیکت بسته شده و امکان ارسال پیام ندارد.</p> : <form onSubmit={sendReply} style={{ display: "grid", gap: 10 }}><textarea required maxLength={10000} rows={3} value={reply} onChange={e => setReply(e.target.value)} style={{ ...field, resize: "vertical" }} placeholder="پیامت رو بنویس…" /><button disabled={busy} style={{ ...button, justifySelf: "start", opacity: busy ? .6 : 1 }}>{busy ? "در حال ارسال…" : "ارسال پیام"}</button></form>}</> : <p style={{ color: "#6b7280", lineHeight: 1.9 }}>برای مشاهده پیام‌ها، یکی از تیکت‌ها رو انتخاب کن.</p>}</section>
      </div>
    </div>
  </main>;
}
