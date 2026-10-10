"use client";

import { useCallback, useEffect, useState } from "react";
import CustomerShell from "@/components/CustomerShell";
import { api } from "@/lib/api";
import {
  AlertCircle,
  Bot,
  CheckCircle2,
  ExternalLink,
  LoaderCircle,
  MessageCircle,
  PlugZap,
  RefreshCw,
  ShieldCheck,
  Unplug,
} from "lucide-react";

type Agent = { id: string; name?: string; isActive?: boolean };
type Channel = {
  id: string;
  type: string;
  name: string;
  isActive: boolean;
  config?: { botUsername?: string; botId?: number; hasBotToken?: boolean; webhookUrl?: string };
};

export default function CustomerTelegramPage() {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [botToken, setBotToken] = useState("");
  const [botUsername, setBotUsername] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const agentResult = await api<any>("/agent");
      const currentAgent: Agent | null =
        agentResult?.agent ?? agentResult?.data?.agent ?? agentResult?.data ?? null;
      if (!currentAgent?.id) {
        setAgent(null);
        setChannel(null);
        setError("ابتدا از بخش «ایجنت‌های هوشمند» یک ایجنت بساز.");
        return;
      }
      setAgent(currentAgent);

      const channelResult = await api<any>("/agent/channels");
      const channels: Channel[] = Array.isArray(channelResult?.channels)
        ? channelResult.channels
        : Array.isArray(channelResult?.data)
          ? channelResult.data
          : [];
      const telegram = channels.find((item) => item.type === "TELEGRAM") ?? null;
      setChannel(telegram);
      setBotUsername(telegram?.config?.botUsername ?? "");
      setWebhookUrl(telegram?.config?.webhookUrl ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "دریافت وضعیت ربات ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function connect() {
    if (!agent?.id) {
      setError("ابتدا یک ایجنت هوشمند بساز.");
      return;
    }
    if (!botToken.trim()) {
      setError("توکن ربات را وارد کن.");
      return;
    }

    setConnecting(true);
    setError("");
    setNotice("");
    try {
      let targetChannel = channel;
      if (!targetChannel) {
        const created = await api<any>("/agent/channels", {
          method: "POST",
          body: JSON.stringify({
            type: "TELEGRAM",
            name: "Telegram",
            isActive: false,
          }),
        });
        targetChannel = created?.channel ?? created?.data?.channel ?? null;
        if (!targetChannel?.id) {
          throw new Error(created?.message || "ساخت کانال تلگرام ناموفق بود.");
        }
        setChannel(targetChannel);
      }

      const result = await api<any>("/telegram/connect", {
        method: "POST",
        body: JSON.stringify({
          agentId: agent.id,
          channelId: targetChannel.id,
          botToken: botToken.trim(),
          name: "Telegram",
        }),
      });

      if (!result?.success) {
        throw new Error(result?.message || "اتصال ربات ناموفق بود.");
      }

      setBotToken("");
      setBotUsername(result?.bot?.username ?? "");
      setWebhookUrl(result?.webhook?.url ?? "");
      setNotice("ربات تلگرام با موفقیت متصل شد. پیام‌های کاربران از همان ایجنت، دانش، محصولات و CRM سایت استفاده می‌کنند.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "اتصال ربات ناموفق بود.");
    } finally {
      setConnecting(false);
    }
  }

  async function disconnect() {
    if (!channel?.id) return;
    setDisconnecting(true);
    setError("");
    setNotice("");
    try {
      await api<any>(`/telegram/channels/${encodeURIComponent(channel.id)}/disconnect`, {
        method: "POST",
        body: JSON.stringify({}),
      });
      setNotice("اتصال ربات قطع شد.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "قطع اتصال ناموفق بود.");
    } finally {
      setDisconnecting(false);
    }
  }

  const connected = Boolean(channel?.isActive && channel?.config?.hasBotToken);

  return (
    <CustomerShell>
      <div className="mx-auto max-w-5xl pb-12" dir="rtl">
        <div className="relative mb-7 overflow-hidden rounded-3xl border border-[#DCE7E4] bg-gradient-to-br from-white via-[#F4FBF9] to-[#E8F4F1] p-6 shadow-sm sm:p-8">
          <div className="pointer-events-none absolute -left-12 -top-14 h-48 w-48 rounded-full bg-[#10706B]/10 blur-3xl" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#10706B]/20 bg-white/80 px-3 py-1 text-xs font-bold text-[#10706B]">
                <Bot size={15} /> کانال ارتباطی
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">اتصال ربات تلگرام</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                ربات تلگرام به همان ایجنت وب‌سایت متصل می‌شود؛ مکالمات، اطلاعات مشتری، دانش کسب‌وکار، محصولات و سرنخ‌های CRM در یک مسیر پردازش می‌شوند.
              </p>
            </div>
            <button onClick={() => void load()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#DCE7E4] bg-white px-4 py-3 text-sm font-bold text-[#31534E] disabled:opacity-50">
              {loading ? <LoaderCircle size={16} className="animate-spin" /> : <RefreshCw size={16} />} تازه‌سازی
            </button>
          </div>
        </div>

        {error && <div role="alert" className="mb-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-700"><AlertCircle size={18} className="mt-0.5 shrink-0" /><span>{error}</span></div>}
        {notice && <div role="status" className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-700"><CheckCircle2 size={18} className="mt-0.5 shrink-0" /><span>{notice}</span></div>}

        {loading ? (
          <div className="flex items-center justify-center gap-3 rounded-3xl border border-[#E4EBE8] bg-white p-16 text-sm text-slate-500"><LoaderCircle size={24} className="animate-spin text-[#10706B]" /> در حال بررسی وضعیت ربات...</div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <section className="rounded-3xl border border-[#E4EBE8] bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-6 flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#E4F3EF] text-[#10706B]"><PlugZap size={22} /></span>
                <div><h2 className="font-black text-slate-900">تنظیم اتصال</h2><p className="mt-1 text-xs text-slate-500">توکن را از ربات رسمی BotFather دریافت کن.</p></div>
              </div>

              {!agent ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">برای اتصال تلگرام ابتدا از منوی «ایجنت‌های هوشمند» ایجنت کسب‌وکارت را ایجاد کن.</div>
              ) : (
                <>
                  <div className="mb-5 rounded-2xl bg-[#F7FAF9] p-4">
                    <p className="text-xs text-slate-500">ایجنت مورد استفاده</p>
                    <p className="mt-1 font-bold text-slate-800">{agent.name || "ایجنت کسب‌وکار"}</p>
                    <p className="mt-1 text-xs text-slate-500">همین ایجنت منطق پاسخ‌گویی وب‌سایت و تلگرام را اجرا می‌کند.</p>
                  </div>

                  <label htmlFor="telegram-token" className="mb-2 block text-sm font-bold text-slate-800">Bot Token</label>
                  <input
                    id="telegram-token"
                    type="password"
                    autoComplete="off"
                    value={botToken}
                    onChange={(event) => setBotToken(event.target.value)}
                    placeholder={connected ? "برای تغییر توکن، توکن جدید را وارد کن" : "123456789:AA..."}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 font-mono text-sm outline-none transition focus:border-[#10706B] focus:ring-4 focus:ring-[#10706B]/10"
                  />
                  <p className="mt-2 text-xs leading-5 text-slate-500">توکن در فرم دوباره نمایش داده نمی‌شود و API فهرست کانال‌ها نیز آن را برنمی‌گرداند.</p>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button onClick={() => void connect()} disabled={connecting || !botToken.trim()} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#10706B] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#0B5B57] disabled:cursor-not-allowed disabled:opacity-50">
                      {connecting ? <LoaderCircle size={17} className="animate-spin" /> : <MessageCircle size={17} />}
                      {connecting ? "در حال اتصال..." : connected ? "اتصال مجدد / تغییر توکن" : "اتصال ربات"}
                    </button>
                    {connected && <button onClick={() => void disconnect()} disabled={disconnecting} className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 px-5 py-3.5 text-sm font-bold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50">
                      {disconnecting ? <LoaderCircle size={17} className="animate-spin" /> : <Unplug size={17} />} قطع اتصال
                    </button>}
                  </div>
                </>
              )}
            </section>

            <aside className="space-y-4">
              <section className="rounded-3xl border border-[#E4EBE8] bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className={`grid h-11 w-11 place-items-center rounded-2xl ${connected ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
                    {connected ? <CheckCircle2 size={22} /> : <Bot size={22} />}
                  </span>
                  <div><p className="font-black text-slate-900">وضعیت ربات</p><p className={`mt-1 text-xs font-bold ${connected ? "text-emerald-600" : "text-slate-500"}`}>{connected ? "متصل و فعال" : "هنوز متصل نشده"}</p></div>
                </div>
                {connected && botUsername && <a href={`https://t.me/${botUsername}`} target="_blank" rel="noreferrer" className="mt-5 flex items-center justify-between rounded-xl bg-[#F2F8F6] p-3 text-sm font-bold text-[#10706B]"><span dir="ltr">@{botUsername}</span><ExternalLink size={15} /></a>}
                {connected && webhookUrl && <div className="mt-4 break-all rounded-xl bg-slate-50 p-3"><p className="mb-1 text-[11px] font-bold text-slate-500">Webhook URL</p><code className="text-[10px] leading-5 text-slate-600">{webhookUrl}</code></div>}
              </section>

              <section className="rounded-3xl border border-[#DCE7E4] bg-[#F3F9F7] p-5">
                <div className="mb-3 flex items-center gap-2 font-black text-[#173D38]"><ShieldCheck size={18} className="text-[#10706B]" /> مسیر پردازش پیام</div>
                <ol className="space-y-3 text-xs leading-5 text-[#526B65]">
                  <li className="flex gap-2"><span className="font-black text-[#10706B]">۱.</span> دریافت پیام از تلگرام</li>
                  <li className="flex gap-2"><span className="font-black text-[#10706B]">۲.</span> ثبت مشتری و مکالمه با جداسازی کسب‌وکار</li>
                  <li className="flex gap-2"><span className="font-black text-[#10706B]">۳.</span> اجرای همان AI، دانش، محصولات و CRM</li>
                  <li className="flex gap-2"><span className="font-black text-[#10706B]">۴.</span> ذخیره پاسخ و ارسال به تلگرام</li>
                </ol>
              </section>
            </aside>
          </div>
        )}
      </div>
    </CustomerShell>
  );
}
