"use client";

import { useCallback, useEffect, useState } from "react";
import CustomerShell from "@/components/CustomerShell";
import { api } from "@/lib/api";
import { AlertCircle, LoaderCircle, RefreshCw, Database, Plus, X } from "lucide-react";

type Props = { title: string; description: string; endpoint: string; collection: string; empty: string };

function pickRows(value: any, collection: string): any[] {
  if (Array.isArray(value?.[collection])) return value[collection];
  if (collection === "agent" && value?.agent && typeof value.agent === "object") return [value.agent];
  if (collection === "user" && value?.data && typeof value.data === "object" && !Array.isArray(value.data)) return [value.data];
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.data?.[collection])) return value.data[collection];
  if (Array.isArray(value?.customers)) return value.customers;
  if (Array.isArray(value?.leads)) return value.leads;
  if (Array.isArray(value?.conversations)) return value.conversations;
  if (Array.isArray(value?.channels)) return value.channels;
  return [];
}

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export default function CustomerResourcePage({ title, description, endpoint, collection, empty }: Props) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [channelType, setChannelType] = useState("WEBSITE");
  const [channelName, setChannelName] = useState("Website");
  const [channelActive, setChannelActive] = useState(true);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await api<any>(endpoint);
      if (result?.success === false) {
        throw new Error(result.message || "دریافت اطلاعات ناموفق بود.");
      }
      setRows(pickRows(result, collection));
    } catch (e) {
      const message = e instanceof Error ? e.message : "دریافت اطلاعات ناموفق بود.";

      // The API returns 404 when this tenant has not created an agent yet.
      // Treat that as an empty resource, not as a broken page.
      if (collection === "agent" && message.trim().toLowerCase() === "agent not found") {
        setRows([]);
        setError("");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }, [endpoint, collection]);

  useEffect(() => {
    void load();
  }, [load]);

  const createChannel = async () => {
    setCreating(true);
    setError("");
    try {
      await api("/agent/channels", {
        method: "POST",
        body: JSON.stringify({
          type: channelType,
          name: channelName.trim() || channelType,
          isActive: channelActive,
        }),
      });
      setCreateOpen(false);
      setChannelType("WEBSITE");
      setChannelName("Website");
      setChannelActive(true);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "ساخت کانال ناموفق بود.");
    } finally {
      setCreating(false);
    }
  };

  const columns = Array.from(
    new Set(rows.slice(0, 30).flatMap((row) => Object.keys(row || {}))),
  )
    .filter((key) => !["tenantId", "password", "updatedAt", "deletedAt"].includes(key))
    .slice(0, 6);

  return (
    <CustomerShell>
      <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-bold text-[#10706B]">فضای کسب‌وکار</p>
          <h1 className="text-2xl font-black">{title}</h1>
          <p className="mt-2 text-sm text-[#7D8D89]">{description}</p>
        </div>
        {collection === "channels" && (
          <button
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#10706B] px-4 py-3 text-sm font-bold text-white hover:bg-[#0B5B57]"
          >
            <Plus size={16} /> افزودن کانال
          </button>
        )}
        <button
          onClick={() => { void load(); }}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-3 text-sm font-bold disabled:opacity-50"
        >
          <RefreshCw size={16} /> تازه‌سازی
        </button>
      </div>

      {error && (
        <div role="alert" className="mb-4 flex gap-2 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border bg-white p-12 text-sm text-slate-500">
          <LoaderCircle className="animate-spin" size={18} /> دریافت داده از API...
        </div>
      ) : !rows.length ? (
        <div className="rounded-2xl border border-[#E4EBE8] bg-white p-12 text-center">
          <Database className="mx-auto mb-3 text-[#10706B]" size={28} />
          <p className="font-bold">{empty}</p>
          <p className="mt-2 text-xs text-[#87938F]">
            هیچ داده نمونه‌ای به‌جای اطلاعات واقعی نمایش داده نمی‌شود.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#E4EBE8] bg-white">
          <table className="w-full min-w-[600px] text-right text-sm">
            <thead className="bg-[#F7FAF8]">
              <tr>
                {columns.map((key) => (
                  <th key={key} className="px-4 py-3 font-bold text-[#6C7D77]">{key}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF1EF]">
              {rows.map((row, index) => (
                <tr key={String(row.id ?? row._id ?? index)}>
                  {columns.map((key) => (
                    <td key={key} className="max-w-xs truncate px-4 py-3 text-[#334B44]">
                      {displayValue(row[key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {collection === "channels" && createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!creating) void createChannel();
            }}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            dir="rtl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-black">افزودن کانال جدید</h2>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="بستن"
              >
                <X size={20} />
              </button>
            </div>

            <label className="mb-2 block text-sm font-bold">نوع کانال</label>
            <select
              value={channelType}
              onChange={(event) => {
                const type = event.target.value;
                setChannelType(type);
                setChannelName(
                  type === "WEBSITE" ? "Website" :
                  type === "WORDPRESS" ? "WordPress" :
                  type === "TELEGRAM" ? "Telegram" : "WhatsApp"
                );
              }}
              className="mb-4 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#10706B]"
            >
              <option value="WEBSITE">وب‌سایت (Website)</option>
              <option value="WORDPRESS">وردپرس (WordPress)</option>
              <option value="TELEGRAM">تلگرام (Telegram)</option>
              <option value="WHATSAPP">واتساپ (WhatsApp)</option>
            </select>

            <label className="mb-2 block text-sm font-bold">نام کانال</label>
            <input
              value={channelName}
              onChange={(event) => setChannelName(event.target.value)}
              placeholder="مثلاً وب‌سایت فروشگاه"
              className="mb-4 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#10706B]"
            />

            <label className="mb-6 flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={channelActive}
                onChange={(event) => setChannelActive(event.target.checked)}
                className="h-4 w-4 accent-[#10706B]"
              />
              کانال فعال باشد
            </label>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="flex-1 rounded-xl border px-4 py-3 text-sm font-bold"
              >
                انصراف
              </button>
              <button
                type="submit"
                disabled={creating}
                className="flex-1 rounded-xl bg-[#10706B] px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                {creating ? "در حال ساخت..." : "ساخت کانال"}
              </button>
            </div>
          </form>
        </div>
      )}
    </CustomerShell>
  );
}
