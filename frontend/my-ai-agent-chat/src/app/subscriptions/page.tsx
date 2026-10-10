"use client";

import { useCallback, useEffect, useState } from "react";
import Shell from "@/components/Shell";
import PageHeader from "@/components/PageHeader";
import { api } from "@/lib/api";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  RefreshCw,
  CalendarDays,
  Building2,
  CreditCard,
  CheckCircle2,
  Clock3,
  Ban,
  Loader2,
} from "lucide-react";

type Status = "ACTIVE" | "EXPIRED" | "SUSPENDED" | "CANCELLED";

type Plan = {
  id: string;
  name: string;
  price: number | string;
  currency?: string;
  billingInterval?: "MONTHLY" | "YEARLY";
  status?: string;
};

type Business = {
  id: string;
  name: string;
  email?: string;
  status?: string;
};

type Subscription = {
  id: string;
  tenantId: string;
  planId: string;
  status: Status;
  startsAt: string;
  expiresAt: string;
  siteId?: string | null;
  cancelledAt?: string | null;
  createdAt?: string;
  tenant?: Business;
  plan?: Plan;
};

type FormState = {
  tenantId: string;
  planId: string;
  status: Status;
  startsAt: string;
  expiresAt: string;
  siteId: string;
  siteName: string;
  domain: string;
};

const emptyForm: FormState = {
  tenantId: "",
  planId: "",
  status: "ACTIVE",
  startsAt: "",
  expiresAt: "",
  siteId: "",
  siteName: "",
  domain: "",
};

const statusLabels: Record<Status, string> = {
  ACTIVE: "فعال",
  EXPIRED: "منقضی",
  SUSPENDED: "معلق",
  CANCELLED: "لغوشده",
};

const statusStyles: Record<Status, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700",
  EXPIRED: "bg-amber-50 text-amber-700",
  SUSPENDED: "bg-orange-50 text-orange-700",
  CANCELLED: "bg-rose-50 text-rose-700",
};

function toDateInput(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  );
  return local.toISOString().slice(0, 16);
}

function generateSuggestedSiteId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `AT-${crypto.randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase()}`;
  }
  return `AT-${Math.random().toString(36).slice(2, 14).toUpperCase()}`;
}

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
  }).format(date);
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "عملیات با خطا مواجه شد.";
}

export default function Subscriptions() {
  const [items, setItems] = useState<Subscription[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Subscription | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const canCreate = businesses.length > 0 && plans.length > 0;

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [subscriptionResponse, businessResponse, planResponse] =
        await Promise.all([
          api<{ success: boolean; subscriptions: Subscription[] }>(
            "/admin/subscriptions"
          ),
          api<{ success: boolean; data: Business[] }>(
            "/admin/businesses"
          ),
          api<{ success: boolean; plans: Plan[] }>(
            "/admin/plans"
          ),
        ]);

      setItems(subscriptionResponse.subscriptions || []);
      setBusinesses(businessResponse.data || []);
      setPlans(planResponse.plans || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  function openCreate() {
    if (!canCreate) {
      setError(
        !businesses.length
          ? "برای ساخت اشتراک، ابتدا باید حداقل یک کسب‌وکار داشته باشید."
          : "برای ساخت اشتراک، ابتدا باید حداقل یک پلن داشته باشید."
      );
      return;
    }

    setEditing(null);
    setForm({
      ...emptyForm,
      tenantId: businesses[0]?.id || "",
      planId:
        plans.find((p) => p.status !== "INACTIVE")?.id ||
        plans[0]?.id ||
        "",
      startsAt: toDateInput(new Date().toISOString()),
      expiresAt: toDateInput(
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      ),
      status: "ACTIVE",
      siteId: generateSuggestedSiteId(),
      siteName: businesses[0]?.name || "",
      domain: "",
    });
    setError("");
    setNotice("");
    setModalOpen(true);
  }

  function openEdit(item: Subscription) {
    setEditing(item);
    setForm({
      tenantId: item.tenantId,
      planId: item.planId,
      status: item.status,
      startsAt: toDateInput(item.startsAt),
      expiresAt: toDateInput(item.expiresAt),
      siteId: item.siteId || "",
      siteName: "",
      domain: "",
    });
    setError("");
    setNotice("");
    setModalOpen(true);
  }

  function updateField<K extends keyof FormState>(
    key: K,
    value: FormState[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setNotice("");

    if (!editing && !form.tenantId) {
      setError("لطفاً کسب‌وکار را انتخاب کن.");
      return;
    }

    if (!form.planId) {
      setError("لطفاً پلن را انتخاب کن.");
      return;
    }

    if (!editing && (!form.siteId.trim() || !form.siteName.trim() || !form.domain.trim())) {
      setError("شناسه سایت، نام سایت و دامنه الزامی است.");
      return;
    }

    if (!editing && !/^[A-Za-z0-9][A-Za-z0-9_-]{2,49}$/.test(form.siteId.trim())) {
      setError("Site ID باید ۳ تا ۵۰ کاراکتر انگلیسی، عدد، خط تیره یا زیرخط باشد.");
      return;
    }

    if (!form.startsAt || !form.expiresAt) {
      setError("تاریخ شروع و پایان الزامی است.");
      return;
    }

    if (new Date(form.expiresAt) <= new Date(form.startsAt)) {
      setError("تاریخ پایان باید بعد از تاریخ شروع باشد.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        planId: form.planId,
        status: form.status,
        startsAt: new Date(form.startsAt).toISOString(),
        expiresAt: new Date(form.expiresAt).toISOString(),
        ...(editing ? {} : {
          siteId: form.siteId.trim().toUpperCase(),
          siteName: form.siteName.trim(),
          domain: form.domain.trim(),
        }),
      };

      if (editing) {
        await api(`/admin/subscriptions/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        setNotice("تغییرات اشتراک ذخیره شد.");
      } else {
        await api("/admin/subscriptions", {
          method: "POST",
          body: JSON.stringify({
            ...payload,
            tenantId: form.tenantId,
          }),
        });
        setNotice("اشتراک جدید با موفقیت ایجاد شد.");
      }

      setModalOpen(false);
      setEditing(null);
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item: Subscription) {
    const businessName = item.tenant?.name || "این کسب‌وکار";
    const confirmed = window.confirm(
      `اشتراک ${businessName} حذف شود؟ این عملیات قابل بازگشت نیست.`
    );

    if (!confirmed) return;

    setDeletingId(item.id);
    setError("");
    setNotice("");

    try {
      await api(`/admin/subscriptions/${item.id}`, {
        method: "DELETE",
      });
      setItems((current) => current.filter((x) => x.id !== item.id));
      setNotice("اشتراک حذف شد.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeletingId("");
    }
  }

  const filteredItems = items.filter((item) => {
    const query = search.trim().toLowerCase();
    const businessName = item.tenant?.name || "";
    const planName = item.plan?.name || "";
    const matchesSearch =
      !query ||
      businessName.toLowerCase().includes(query) ||
      planName.toLowerCase().includes(query) ||
      item.id.toLowerCase().includes(query) ||
      (item.siteId || "").toLowerCase().includes(query);

    const matchesStatus =
      filterStatus === "ALL" || item.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const counts = {
    total: items.length,
    active: items.filter((x) => x.status === "ACTIVE").length,
    suspended: items.filter((x) => x.status === "SUSPENDED").length,
    expired: items.filter(
      (x) =>
        x.status === "EXPIRED" ||
        (x.status === "ACTIVE" && new Date(x.expiresAt) < new Date())
    ).length,
  };

  return (
    <Shell>
      <PageHeader
        title="اشتراک‌ها"
        description="مدیریت اشتراک کسب‌وکارها، پلن‌ها و تاریخ اعتبار سرویس"
        action={
          <button
            type="button"
            onClick={openCreate}
            disabled={!canCreate}
            title={
              !businesses.length
                ? "ابتدا یک کسب‌وکار ایجاد کنید"
                : !plans.length
                  ? "ابتدا یک پلن ایجاد کنید"
                  : "افزودن اشتراک"
            }
            className="flex h-11 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={18} />
            افزودن اشتراک
          </button>
        }
      />

      {notice && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          <CheckCircle2 size={18} />
          {notice}
          <button
            className="mr-auto"
            onClick={() => setNotice("")}
            aria-label="بستن پیام"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {error && !modalOpen && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          <span>{error}</span>
          <button
            className="shrink-0 underline"
            onClick={() => {
              setError("");
              void loadData();
            }}
          >
            تلاش مجدد
          </button>
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          {
            label: "کل اشتراک‌ها",
            value: counts.total,
            icon: CreditCard,
            color: "text-emerald-600",
          },
          {
            label: "فعال",
            value: counts.active,
            icon: CheckCircle2,
            color: "text-emerald-600",
          },
          {
            label: "معلق",
            value: counts.suspended,
            icon: Ban,
            color: "text-orange-600",
          },
          {
            label: "منقضی",
            value: counts.expired,
            icon: Clock3,
            color: "text-amber-600",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div className="card p-5" key={stat.label}>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-500">{stat.label}</span>
                <Icon size={19} className={stat.color} />
              </div>
              <div className="mt-3 text-3xl font-black">{stat.value}</div>
            </div>
          );
        })}
      </div>

      <div className="card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جست‌وجوی کسب‌وکار، پلن یا شناسه..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pr-10 pl-3 text-sm outline-none focus:border-emerald-600"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-600"
          >
            <option value="ALL">همه وضعیت‌ها</option>
            <option value="ACTIVE">فعال</option>
            <option value="EXPIRED">منقضی</option>
            <option value="SUSPENDED">معلق</option>
            <option value="CANCELLED">لغوشده</option>
          </select>

          <button
            onClick={() => void loadData()}
            disabled={loading}
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#DDEFEA] bg-[#E8F5F3] px-4 text-sm font-bold text-[#10706B] hover:bg-[#DDEFEA] disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            بروزرسانی
          </button>
        </div>

        {loading ? (
          <div className="flex min-h-56 items-center justify-center gap-3 text-sm text-slate-500">
            <Loader2 size={20} className="animate-spin" />
            در حال دریافت اطلاعات...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex min-h-56 flex-col items-center justify-center px-5 py-10 text-center">
            <CreditCard size={35} className="mb-3 text-slate-300" />
            <p className="font-bold text-slate-700">
              {items.length ? "نتیجه‌ای پیدا نشد" : "هنوز اشتراکی ثبت نشده"}
            </p>
            <p className="mt-2 text-sm text-slate-400">
              {items.length
                ? "عبارت جست‌وجو یا فیلتر وضعیت را تغییر بده."
                : "با دکمه زیر، اولین اشتراک را ثبت کن."}
            </p>

            {!items.length && (
              <div className="mt-5">
                <button
                  type="button"
                  onClick={openCreate}
                  disabled={!canCreate}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus size={18} />
                  افزودن اولین اشتراک
                </button>
                {!canCreate && (
                  <p className="mt-2 text-xs text-rose-600">
                    {!businesses.length
                      ? "برای ساخت اشتراک، ابتدا باید حداقل یک کسب‌وکار داشته باشید."
                      : "برای ساخت اشتراک، ابتدا باید حداقل یک پلن داشته باشید."}
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-right text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">کسب‌وکار</th>
                  <th className="px-5 py-4 font-semibold">Site ID</th>
                  <th className="px-5 py-4 font-semibold">پلن</th>
                  <th className="px-5 py-4 font-semibold">مبلغ پلن</th>
                  <th className="px-5 py-4 font-semibold">شروع</th>
                  <th className="px-5 py-4 font-semibold">پایان</th>
                  <th className="px-5 py-4 font-semibold">وضعیت</th>
                  <th className="px-5 py-4 font-semibold">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="transition hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                          <Building2 size={18} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">
                            {item.tenant?.name || "کسب‌وکار"}
                          </div>
                          <div className="mt-1 max-w-48 truncate text-xs text-slate-400">
                            {item.tenant?.email || item.tenantId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-mono text-xs font-bold text-[#10706B]">
                        {item.siteId || "—"}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-700">
                        {item.plan?.name || "پلن حذف‌شده"}
                      </div>
                      <div className="mt-1 text-xs text-slate-400">
                        {item.plan?.billingInterval === "YEARLY"
                          ? "سالانه"
                          : "ماهانه"}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-semibold">
                      {item.plan
                        ? `${Number(item.plan.price).toLocaleString()} ${item.plan.currency || "USD"}`
                        : "—"}
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {formatDate(item.startsAt)}
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {formatDate(item.expiresAt)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${statusStyles[item.status] || "bg-slate-100 text-slate-600"}`}
                      >
                        {statusLabels[item.status] || item.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(item)}
                          title="ویرایش اشتراک"
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-emerald-600 hover:text-emerald-700"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => void handleDelete(item)}
                          disabled={deletingId === item.id}
                          title="حذف اشتراک"
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-rose-100 text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                        >
                          {deletingId === item.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400">
            نمایش {filteredItems.length} از {items.length} اشتراک
          </div>
        )}
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !saving) {
              setModalOpen(false);
            }
          }}
        >
          <div className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-black text-slate-800">
                  {editing ? "ویرایش اشتراک" : "افزودن اشتراک جدید"}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  اطلاعات اشتراک را وارد و ذخیره کن.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                disabled={saving}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[#10706B] hover:bg-[#E8F5F3] hover:text-[#10706B]"
                aria-label="بستن"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="grid gap-5 p-6 md:grid-cols-2">
                {error && (
                  <div className="md:col-span-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                    {error}
                  </div>
                )}

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    کسب‌وکار *
                  </span>
                  <select
                    required
                    value={form.tenantId}
                    disabled={Boolean(editing)}
                    onChange={(e) => {
                      const tenantId = e.target.value;
                      const selectedBusiness = businesses.find((business) => business.id === tenantId);
                      setForm((current) => ({
                        ...current,
                        tenantId,
                        siteName: selectedBusiness?.name || current.siteName,
                      }));
                    }}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-600 disabled:bg-slate-100"
                  >
                    <option value="">انتخاب کسب‌وکار</option>
                    {businesses.map((business) => (
                      <option key={business.id} value={business.id}>
                        {business.name} — {business.email}
                      </option>
                    ))}
                  </select>
                  {editing && (
                    <span className="mt-1 block text-xs text-slate-400">
                      کسب‌وکار این اشتراک قابل تغییر نیست.
                    </span>
                  )}
                </label>

                {!editing && (
                  <>
                    <label className="block md:col-span-2">
                      <span className="mb-2 block text-sm font-bold text-slate-700">Site ID *</span>
                      <div className="flex gap-2">
                        <input required value={form.siteId} onChange={(e) => updateField("siteId", e.target.value.toUpperCase())} placeholder="AT-XXXXXXXXXXXX" maxLength={50} className="h-12 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 font-mono text-sm outline-none focus:border-emerald-600" />
                        <button type="button" onClick={() => updateField("siteId", generateSuggestedSiteId())} className="h-12 shrink-0 rounded-xl border border-[#DDEFEA] bg-[#E8F5F3] px-3 text-sm font-bold text-[#10706B] hover:bg-[#DDEFEA]">تولید شناسه</button>
                      </div>
                      <span className="mt-1 block text-xs text-slate-400">شناسه را سوپرادمین تعیین می‌کند و مشتری آن را تغییر نمی‌دهد.</span>
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-slate-700">نام سایت *</span>
                      <input required value={form.siteName} onChange={(e) => updateField("siteName", e.target.value)} placeholder="مثلاً فروشگاه من" className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-600" />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-slate-700">دامنه سایت *</span>
                      <input required value={form.domain} onChange={(e) => updateField("domain", e.target.value)} placeholder="example.com" className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-600" />
                    </label>
                  </>
                )}

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    پلن اشتراک *
                  </span>
                  <select
                    required
                    value={form.planId}
                    onChange={(e) => updateField("planId", e.target.value)}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-600"
                  >
                    <option value="">انتخاب پلن</option>
                    {plans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} — {Number(plan.price).toLocaleString()}{" "}
                        {plan.currency || "USD"}
                        {plan.status === "INACTIVE" ? " (غیرفعال)" : ""}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    تاریخ شروع *
                  </span>
                  <div className="relative">
                    <CalendarDays
                      size={17}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      required
                      type="datetime-local"
                      value={form.startsAt}
                      onChange={(e) => updateField("startsAt", e.target.value)}
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 pr-10 text-sm outline-none focus:border-emerald-600"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    تاریخ پایان *
                  </span>
                  <div className="relative">
                    <CalendarDays
                      size={17}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      required
                      type="datetime-local"
                      min={form.startsAt || undefined}
                      value={form.expiresAt}
                      onChange={(e) => updateField("expiresAt", e.target.value)}
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 pr-10 text-sm outline-none focus:border-emerald-600"
                    />
                  </div>
                </label>

                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    وضعیت اشتراک *
                  </span>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      updateField("status", e.target.value as Status)
                    }
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-600"
                  >
                    <option value="ACTIVE">فعال</option>
                    <option value="EXPIRED">منقضی</option>
                    <option value="SUSPENDED">معلق</option>
                    <option value="CANCELLED">لغوشده</option>
                  </select>
                </label>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                  className="h-11 rounded-xl border border-[#DDEFEA] bg-[#E8F5F3] px-5 text-sm font-bold text-[#10706B] hover:bg-[#DDEFEA] disabled:opacity-50"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      در حال ذخیره...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={17} />
                      {editing ? "اعمال تغییرات" : "ایجاد اشتراک"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Shell>
  );
}