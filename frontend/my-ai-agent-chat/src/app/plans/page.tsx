"use client";

import { useCallback, useEffect, useState } from "react";
import Shell from "@/components/Shell";
import PageHeader from "@/components/PageHeader";
import { api } from "@/lib/api";
import {
  Plus,
  Check,
  Pencil,
  Trash2,
  X,
  Loader2,
  RefreshCw,
  Sparkles,
  Crown,
  Users,
  Target,
  Package,
  MessageSquare,
  Zap,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Search,
  Filter,
} from "lucide-react";

type Plan = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number | string;
  currency: string;
  billingInterval: string;
  maxCustomers: number;
  maxLeads: number;
  maxProducts: number;
  maxAiMessages: number;
  isPopular: boolean;
  status: string;
};

type PlanForm = {
  name: string;
  slug: string;
  description: string;
  price: string;
  currency: string;
  billingInterval: string;
  maxCustomers: string;
  maxLeads: string;
  maxProducts: string;
  maxAiMessages: string;
  isPopular: boolean;
  status: string;
};

const emptyForm: PlanForm = {
  name: "",
  slug: "",
  description: "",
  price: "0",
  currency: "USD",
  billingInterval: "MONTHLY",
  maxCustomers: "100",
  maxLeads: "100",
  maxProducts: "100",
  maxAiMessages: "1000",
  isPopular: false,
  status: "ACTIVE",
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 placeholder:text-slate-400";

export default function Plans() {
  const [items, setItems] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<PlanForm>(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");

  const loadPlans = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api<any>("/admin/plans");
      const result = response.plans ?? response.data ?? [];
      setItems(Array.isArray(result) ? result : result.plans ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "دریافت پلن‌ها ناموفق بود");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPlans();
  }, [loadPlans]);

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(""), 3500);
    return () => clearTimeout(t);
  }, [success]);

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm });
    setError("");
    setSuccess("");
    setModalOpen(true);
  }

  function openEdit(plan: Plan) {
    setEditing(plan);
    setForm({
      name: plan.name ?? "",
      slug: plan.slug ?? "",
      description: plan.description ?? "",
      price: String(plan.price ?? 0),
      currency: plan.currency ?? "USD",
      billingInterval: plan.billingInterval ?? "MONTHLY",
      maxCustomers: String(plan.maxCustomers ?? 0),
      maxLeads: String(plan.maxLeads ?? 0),
      maxProducts: String(plan.maxProducts ?? 0),
      maxAiMessages: String(plan.maxAiMessages ?? 0),
      isPopular: Boolean(plan.isPopular),
      status: plan.status ?? "ACTIVE",
    });
    setError("");
    setSuccess("");
    setModalOpen(true);
  }

  function change<K extends keyof PlanForm>(key: K, value: PlanForm[K]) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  async function savePlan(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      currency: form.currency,
      billingInterval: form.billingInterval,
      maxCustomers: Number(form.maxCustomers),
      maxLeads: Number(form.maxLeads),
      maxProducts: Number(form.maxProducts),
      maxAiMessages: Number(form.maxAiMessages),
      isPopular: form.isPopular,
      status: form.status,
    };

    try {
      if (editing) {
        await api(`/admin/plans/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        setSuccess("تغییرات پلن با موفقیت ذخیره شد.");
      } else {
        await api("/admin/plans", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setSuccess("پلن جدید با موفقیت ایجاد شد.");
      }

      setModalOpen(false);
      await loadPlans();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ذخیره پلن ناموفق بود");
    } finally {
      setSaving(false);
    }
  }

  async function deletePlan(plan: Plan) {
    if (!window.confirm(`پلن «${plan.name}» حذف شود؟`)) return;

    setDeletingId(plan.id);
    setError("");
    setSuccess("");

    try {
      await api(`/admin/plans/${plan.id}`, { method: "DELETE" });
      setItems((current) => current.filter((item) => item.id !== plan.id));
      setSuccess("پلن حذف شد.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "حذف پلن ناموفق بود");
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = items.filter((p) =>
    !search.trim()
      ? true
      : p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.slug?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Shell>
      <PageHeader
        title="پلن‌ها"
        description="مدیریت پلن‌های اشتراکی AGENT-TO"
        action={
          <button
            type="button"
            onClick={openCreate}
            className="h-11 px-5 rounded-xl bg-brand-600 text-white text-sm font-bold flex gap-2 items-center shadow-sm hover:bg-brand-700 active:bg-brand-800 transition-colors"
          >
            <Plus size={18} />
            افزودن پلن
          </button>
        }
      />

      {!loading && items.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search
              size={16}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجوی پلن..."
              className={`${inputClass} pr-10`}
            />
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl px-3.5 py-2.5">
            <Filter size={14} />
            {filtered.length} از {items.length} پلن
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle2 size={16} className="text-emerald-600" />
          </div>
          <span className="font-bold">{success}</span>
          <button
            type="button"
            onClick={() => setSuccess("")}
            className="mr-auto text-emerald-600 hover:text-emerald-800"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {error && !modalOpen && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <AlertCircle size={16} className="text-red-600" />
          </div>
          <span className="font-bold">{error}</span>
          <button
            type="button"
            onClick={() => void loadPlans()}
            className="mr-auto flex items-center gap-1.5 text-red-700 hover:text-red-900 font-bold text-xs"
          >
            <RefreshCw size={14} />
            تلاش مجدد
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-5 w-24 bg-slate-200 rounded-lg mb-3" />
              <div className="h-3 w-16 bg-slate-100 rounded mb-5" />
              <div className="h-8 w-32 bg-slate-200 rounded-lg mb-5" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="h-3 w-full bg-slate-100 rounded" />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 mt-6">
                <div className="h-11 bg-slate-100 rounded-xl" />
                <div className="h-11 bg-slate-100 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState onCreate={openCreate} />
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Search size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="font-bold text-slate-600">پلنی با این عنوان یافت نشد</p>
          <p className="text-sm text-slate-400 mt-1">
            عبارت دیگری را جستجو کنید
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              deleting={deletingId === plan.id}
              onEdit={() => openEdit(plan)}
              onDelete={() => void deletePlan(plan)}
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <PlanModal
          editing={editing}
          form={form}
          error={error}
          saving={saving}
          onChange={change}
          onClose={() => setModalOpen(false)}
          onSubmit={savePlan}
        />
      )}
    </Shell>
  );
}

function PlanCard({
  plan,
  deleting,
  onEdit,
  onDelete,
}: {
  plan: Plan;
  deleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isActive = plan.status === "ACTIVE";

  const features = [
    { icon: Users, label: `${Number(plan.maxCustomers ?? 0).toLocaleString()} مشتری`, color: "text-blue-500" },
    { icon: Target, label: `${Number(plan.maxLeads ?? 0).toLocaleString()} لید`, color: "text-emerald-500" },
    { icon: Package, label: `${Number(plan.maxProducts ?? 0).toLocaleString()} محصول`, color: "text-amber-500" },
    { icon: MessageSquare, label: `${Number(plan.maxAiMessages ?? 0).toLocaleString()} پیام AI`, color: "text-violet-500" },
  ];

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-white border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
        plan.isPopular
          ? "border-brand-300 shadow-sm ring-1 ring-brand-500/10"
          : "border-slate-200 shadow-sm hover:shadow-slate-200/60"
      }`}
    >
      {plan.isPopular && (
        <div className="absolute inset-x-0 top-0 h-1 bg-amber-400" />
      )}

      <div className="relative p-6">
        <div className="flex items-start justify-between gap-3 mb-1">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                plan.isPopular
                  ? "bg-amber-100 text-amber-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {plan.isPopular ? <Crown size={18} /> : <Sparkles size={18} />}
            </div>
            <div>
              <div className="text-base font-black text-slate-800 flex items-center gap-2">
                {plan.name}
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                {plan.slug}
              </div>
            </div>
          </div>

          <span
            className={`text-[10px] font-black px-2.5 py-1 rounded-full whitespace-nowrap ${
              isActive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            <span
              className={`inline-block w-1.5 h-1.5 rounded-full ml-1.5 ${
                isActive ? "bg-emerald-500" : "bg-slate-400"
              }`}
            />
            {isActive ? "فعال" : "غیرفعال"}
          </span>
        </div>

        {plan.isPopular && (
          <div className="mt-3 inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-[11px] font-black px-2.5 py-1 rounded-full border border-amber-200">
            <TrendingUp size={12} />
            محبوب‌ترین پلن
          </div>
        )}

        <p className="text-xs text-slate-400 mt-3 min-h-[18px] leading-relaxed line-clamp-2">
          {plan.description || "بدون توضیحات"}
        </p>

        <div className="mt-5 pb-5 border-b border-dashed border-slate-200">
          <div className="flex items-end gap-1.5">
            <b className="text-3xl font-black text-slate-900 tracking-tight">
              {Number(plan.price).toLocaleString()}
            </b>
            <span className="text-xs text-slate-400 font-bold mb-1.5">
              {plan.currency}
            </span>
          </div>
          <span className="text-xs text-slate-400 mt-1 inline-block">
            / {plan.billingInterval === "MONTHLY" ? "ماهانه" : "سالانه"}
          </span>
        </div>

        <div className="mt-5 space-y-2.5">
          {features.map((f) => (
            <div key={f.label} className="flex items-center gap-2.5 text-sm">
              <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                <f.icon size={13} className={f.color} />
              </div>
              <span className="text-slate-600 font-medium">{f.label}</span>
              <Check size={14} className="text-emerald-500 mr-auto" />
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="h-10 rounded-xl border border-[#DDEFEA] bg-[#E8F5F3] text-xs font-bold text-[#10706B] hover:bg-[#DDEFEA] transition-colors flex items-center justify-center gap-1.5"
          >
            <Pencil size={14} />
            ویرایش
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="h-10 rounded-xl border border-red-200 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
          >
            {deleting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            حذف
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="card p-12 md:p-16 text-center">
      <div className="w-20 h-20 mx-auto rounded-3xl bg-brand-50 flex items-center justify-center mb-5">
        <Sparkles size={36} className="text-brand-600" />
      </div>
      <h3 className="text-lg font-black text-slate-800 mb-1.5">
        هنوز پلنی ثبت نشده است
      </h3>
      <p className="text-sm text-slate-400 mb-6 max-w-sm mx-auto leading-relaxed">
        اولین پلن اشتراکی خود را ایجاد کنید و مشتریان را به استفاده از
        سرویس‌های AGENT-TO دعوت کنید.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-white text-sm font-bold shadow-sm hover:bg-brand-700 transition-colors"
      >
        <Plus size={16} />
        افزودن اولین پلن
      </button>
    </div>
  );
}

function PlanModal({
  editing,
  form,
  error,
  saving,
  onChange,
  onClose,
  onSubmit,
}: {
  editing: Plan | null;
  form: PlanForm;
  error: string;
  saving: boolean;
  onChange: <K extends keyof PlanForm>(key: K, value: PlanForm[K]) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 p-4 flex items-center justify-center"
      onClick={onClose}
    >
      <form
        onSubmit={onSubmit}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl"
      >
        <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-6 py-5 flex items-center justify-between rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600">
              {editing ? <Pencil size={18} /> : <Plus size={20} />}
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">
                {editing ? "ویرایش پلن" : "افزودن پلن جدید"}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {editing
                  ? "اطلاعات پلن را به‌روزرسانی کنید"
                  : "پلن اشتراکی جدیدی برای مشتریان بسازید"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-[#E8F5F3] flex items-center justify-center text-[#10706B] hover:text-[#10706B] transition-colors"
            aria-label="بستن"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-5 rounded-xl bg-red-50 border border-red-200 p-3.5 text-sm text-red-700 flex items-center gap-2.5">
              <AlertCircle size={16} className="shrink-0" />
              <span className="font-bold">{error}</span>
            </div>
          )}

          <SectionTitle icon={Sparkles} title="اطلاعات پایه" />
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <Field label="نام پلن" required>
              <input
                required
                value={form.name}
                onChange={(e) => onChange("name", e.target.value)}
                className={inputClass}
                placeholder="مثلاً حرفه‌ای"
              />
            </Field>

            <Field label="شناسه (Slug)" required>
              <input
                required
                value={form.slug}
                onChange={(e) => onChange("slug", e.target.value)}
                className={`${inputClass} font-mono`}
                placeholder="professional"
                dir="ltr"
              />
            </Field>

            <Field label="توضیحات">
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => onChange("description", e.target.value)}
                className={`${inputClass} resize-none`}
                placeholder="توضیح کوتاه درباره این پلن..."
              />
            </Field>

            <div className="space-y-4">
              <Field label="وضعیت">
                <select
                  value={form.status}
                  onChange={(e) => onChange("status", e.target.value)}
                  className={inputClass}
                >
                  <option value="ACTIVE">فعال</option>
                  <option value="INACTIVE">غیرفعال</option>
                </select>
              </Field>

              <label className="flex items-center gap-3 text-sm font-bold text-slate-700 cursor-pointer select-none bg-[#E8F5F3] rounded-xl p-3.5 hover:bg-[#DDEFEA] transition-colors">
                <input
                  type="checkbox"
                  checked={form.isPopular}
                  onChange={(e) => onChange("isPopular", e.target.checked)}
                  className="h-4 w-4 accent-brand-600 rounded"
                />
                <span className="flex items-center gap-1.5">
                  <Crown size={14} className="text-amber-500" />
                  پلن محبوب‌ترین باشد
                </span>
              </label>
            </div>
          </div>

          <SectionTitle icon={TrendingUp} title="قیمت‌گذاری" />
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            <Field label="قیمت" required>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => onChange("price", e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="واحد پول">
              <select
                value={form.currency}
                onChange={(e) => onChange("currency", e.target.value)}
                className={inputClass}
              >
                <option value="USD">USD — دلار</option>
                <option value="IRR">IRR — ریال</option>
                <option value="EUR">EUR — یورو</option>
              </select>
            </Field>

            <Field label="دوره پرداخت">
              <select
                value={form.billingInterval}
                onChange={(e) => onChange("billingInterval", e.target.value)}
                className={inputClass}
              >
                <option value="MONTHLY">ماهانه</option>
                <option value="YEARLY">سالانه</option>
              </select>
            </Field>
          </div>

          <SectionTitle icon={Zap} title="محدودیت‌ها و امکانات" />
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="حداکثر مشتری">
              <input
                required
                type="number"
                min="0"
                value={form.maxCustomers}
                onChange={(e) => onChange("maxCustomers", e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="حداکثر لید">
              <input
                required
                type="number"
                min="0"
                value={form.maxLeads}
                onChange={(e) => onChange("maxLeads", e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="حداکثر محصول">
              <input
                required
                type="number"
                min="0"
                value={form.maxProducts}
                onChange={(e) => onChange("maxProducts", e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="حداکثر پیام AI">
              <input
                required
                type="number"
                min="0"
                value={form.maxAiMessages}
                onChange={(e) => onChange("maxAiMessages", e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex flex-wrap justify-end gap-3 rounded-b-3xl">
          <button
            type="button"
            onClick={onClose}
            className="h-11 px-5 rounded-xl border border-[#DDEFEA] bg-[#E8F5F3] font-bold text-sm text-[#10706B] hover:bg-[#DDEFEA] transition-colors"
          >
            انصراف
          </button>

          <button
            type="submit"
            disabled={saving}
            className="h-11 px-6 rounded-xl bg-brand-600 text-white font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm hover:bg-brand-700 transition-colors"
          >
            {saving ? (
              <Loader2 size={17} className="animate-spin" />
            ) : editing ? (
              <Check size={17} />
            ) : (
              <Plus size={17} />
            )}
            {saving
              ? "در حال ذخیره..."
              : editing
                ? "اعمال ویرایش‌ها"
                : "افزودن پلن"}
          </button>
        </div>
      </form>
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  title,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-4 pb-2.5 border-b border-slate-100">
      <div className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center">
        <Icon size={14} className="text-brand-600" />
      </div>
      <h3 className="text-sm font-black text-slate-700">{title}</h3>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5 text-xs font-bold text-slate-600">
      <span>
        {label}
        {required && <span className="text-red-500 mr-0.5">*</span>}
      </span>
      {children}
    </label>
  );
}