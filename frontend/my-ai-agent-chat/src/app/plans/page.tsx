
"use client";

import { useCallback, useEffect, useState } from "react";
import Shell from "@/components/Shell";
import PageHeader from "@/components/PageHeader";
import { api } from "@/lib/api";
import { Check, Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";

type Plan = {
    id: string;
    name: string;
    slug: string;
    description?: string;
    price: number | string;
    currency: string;
    billingInterval: string;
    limits?: {
        maxCustomers?: number;
        maxLeads?: number;
        maxProducts?: number;
        maxAiMessages?: number;
    };
    maxCustomers: number;
    maxLeads: number;
    maxProducts: number;
    maxAiMessages: number;
    isPopular: boolean;
    status: string;
    features?: string[];
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
    maxProducts: "50",
    maxAiMessages: "1000",
    isPopular: false,
    status: "ACTIVE",
};

function getLimit(plan: Plan, key: keyof NonNullable<Plan["limits"]>) {
    const direct = plan[key as keyof Plan];
    const nested = plan.limits?.[key];
    const value = nested ?? direct;
    return Number(value ?? 0).toLocaleString();
}

export default function Plans() {
    const [items, setItems] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [editing, setEditing] = useState<Plan | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState<PlanForm>(emptyForm);
    const [error, setError] = useState("");

    const loadPlans = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await api<{
                success?: boolean;
                plans?: Plan[];
                data?: Plan[] | { plans?: Plan[] };
            }>("/admin/plans");

            const result = response.plans ?? response.data;
            setItems(
                Array.isArray(result)
                    ? result
                    : result && "plans" in result
                        ? result.plans ?? []
                        : []
            );
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "خطا در دریافت پلن‌ها"
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadPlans();
    }, [loadPlans]);

    function openCreate() {
        setEditing(null);
        setForm(emptyForm);
        setError("");
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
            maxCustomers: String(plan.limits?.maxCustomers ?? plan.maxCustomers ?? 0),
            maxLeads: String(plan.limits?.maxLeads ?? plan.maxLeads ?? 0),
            maxProducts: String(plan.limits?.maxProducts ?? plan.maxProducts ?? 0),
            maxAiMessages: String(
                plan.limits?.maxAiMessages ?? plan.maxAiMessages ?? 0
            ),
            isPopular: Boolean(plan.isPopular),
            status: plan.status ?? "ACTIVE",
        });
        setError("");
        setModalOpen(true);
    }

    function updateField<K extends keyof PlanForm>(key: K, value: PlanForm[K]) {
        setForm((current) => ({ ...current, [key]: value }));
    }

    async function savePlan(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSaving(true);
        setError("");

        const payload = {
            name: form.name.trim(),
            slug: form.slug.trim(),
            description: form.description.trim(),
            price: Number(form.price),
            currency: form.currency,
            billingInterval: form.billingInterval,
            limits: {
                maxCustomers: Number(form.maxCustomers),
                maxLeads: Number(form.maxLeads),
                maxProducts: Number(form.maxProducts),
                maxAiMessages: Number(form.maxAiMessages),
            },
            isPopular: form.isPopular,
            status: form.status,
        };

        try {
            if (editing) {
                await api(`/admin/plans/${editing.id}`, {
                    method: "PATCH",
                    body: JSON.stringify(payload),
                });
            } else {
                await api("/admin/plans", {
                    method: "POST",
                    body: JSON.stringify(payload),
                });
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

        try {
            await api(`/admin/plans/${plan.id}`, { method: "DELETE" });
            setItems((current) => current.filter((item) => item.id !== plan.id));
        } catch (err) {
            setError(err instanceof Error ? err.message : "حذف پلن ناموفق بود");
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <Shell>
            <PageHeader
                title="پلن‌ها"
                description="مدیریت پلن‌های اشتراکی AGENT-TO"
                action={
                    <button
                        onClick={openCreate}
                        className="h-11 px-4 rounded-xl bg-brand-600 text-white text-sm font-bold flex gap-2 items-center"
                    >
                        <Plus size={18} />
                        پلن جدید
                    </button>
                }
            />

            {error && !modalOpen && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center justify-between gap-3">
                    <span>{error}</span>
                    <button onClick={() => void loadPlans()} className="font-bold underline">
                        تلاش مجدد
                    </button>
                </div>
            )}

            {loading ? (
                <div className="card p-12 text-center text-slate-400">
                    <Loader2 className="animate-spin inline-block mb-2" size={22} />
                    <div>در حال بارگذاری...</div>
                </div>
            ) : items.length === 0 ? (
                <div className="card p-12 text-center text-slate-400">
                    هنوز پلنی ثبت نشده است.
                    <div>
                        <button onClick={openCreate} className="mt-4 text-brand-700 font-bold">
                            ساخت اولین پلن
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {items.map((plan) => (
                        <div
                            className={`card p-6 relative ${plan.isPopular ? "ring-2 ring-brand-600/20" : ""
                                }`}
                            key={plan.id}
                        >
                            {plan.isPopular && (
                                <span className="absolute left-5 top-5 bg-brand-50 text-brand-700 text-[11px] font-bold px-2.5 py-1 rounded-full">
                                    محبوب‌ترین
                                </span>
                            )}

                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="text-lg font-black">{plan.name}</div>
                                    <div className="text-xs text-slate-400 mt-1">{plan.slug}</div>
                                </div>
                                <span
                                    className={`text-xs font-bold px-2 py-1 rounded-lg ${plan.status === "ACTIVE"
                                            ? "bg-emerald-50 text-emerald-700"
                                            : "bg-slate-100 text-slate-500"
                                        }`}
                                >
                                    {plan.status === "ACTIVE" ? "فعال" : "غیرفعال"}
                                </span>
                            </div>

                            <div className="text-sm text-slate-400 mt-3 min-h-5">
                                {plan.description || "بدون توضیحات"}
                            </div>

                            <div className="mt-5">
                                <b className="text-3xl">
                                    {Number(plan.price).toLocaleString()}
                                </b>
                                <span className="text-slate-400 text-sm ml-1">
                                    {plan.currency}
                                </span>
                                <span className="text-slate-400 text-sm">
                                    {" "}
                                    / {plan.billingInterval === "MONTHLY" ? "ماه" : "سال"}
                                </span>
                            </div>

                            <div className="mt-6 space-y-3 text-sm">
                                {[
                                    `${getLimit(plan, "maxCustomers")} مشتری`,
                                    `${getLimit(plan, "maxLeads")} لید`,
                                    `${getLimit(plan, "maxProducts")} محصول`,
                                    `${getLimit(plan, "maxAiMessages")} پیام AI`,
                                ].map((feature) => (
                                    <div key={feature} className="flex items-center gap-2">
                                        <Check size={16} className="text-brand-600" />
                                        {feature}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => openEdit(plan)}
                                    className="h-11 rounded-xl border border-slate-200 text-sm font-bold hover:border-brand-600 flex items-center justify-center gap-2"
                                >
                                    <Pencil size={15} />
                                    ویرایش
                                </button>
                                <button
                                    onClick={() => void deletePlan(plan)}
                                    disabled={deletingId === plan.id}
                                    className="h-11 rounded-xl border border-red-200 text-red-600 text-sm font-bold hover:bg-red-50 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {deletingId === plan.id ? (
                                        <Loader2 size={15} className="animate-spin" />
                                    ) : (
                                        <Trash2 size={15} />
                                    )}
                                    حذف
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {modalOpen && (
                <div className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center">
                    <form
                        onSubmit={savePlan}
                        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black">
                                {editing ? "ویرایش پلن" : "ساخت پلن جدید"}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                className="p-2 rounded-lg hover:bg-slate-100"
                                aria-label="بستن"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <div className="grid sm:grid-cols-2 gap-4">
                            <Field label="نام پلن" required>
                                <input
                                    required
                                    value={form.name}
                                    onChange={(e) => updateField("name", e.target.value)}
                                    className={inputClass}
                                    placeholder="مثلاً حرفه‌ای"
                                />
                            </Field>

                            <Field label="Slug" required>
                                <input
                                    required
                                    value={form.slug}
                                    onChange={(e) => updateField("slug", e.target.value)}
                                    className={inputClass}
                                    placeholder="professional"
                                />
                            </Field>

                            <Field label="قیمت" required>
                                <input
                                    required
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={form.price}
                                    onChange={(e) => updateField("price", e.target.value)}
                                    className={inputClass}
                                />
                            </Field>

                            <Field label="واحد پول">
                                <select
                                    value={form.currency}
                                    onChange={(e) => updateField("currency", e.target.value)}
                                    className={inputClass}
                                >
                                    <option value="USD">USD</option>
                                    <option value="IRR">IRR</option>
                                    <option value="EUR">EUR</option>
                                </select>
                            </Field>

                            <Field label="دوره پرداخت">
                                <select
                                    value={form.billingInterval}
                                    onChange={(e) => updateField("billingInterval", e.target.value)}
                                    className={inputClass}
                                >
                                    <option value="MONTHLY">ماهانه</option>
                                    <option value="YEARLY">سالانه</option>
                                </select>
                            </Field>

                            <Field label="وضعیت">
                                <select
                                    value={form.status}
                                    onChange={(e) => updateField("status", e.target.value)}
                                    className={inputClass}
                                >
                                    <option value="ACTIVE">فعال</option>
                                    <option value="INACTIVE">غیرفعال</option>
                                </select>
                            </Field>

                            <Field label="حداکثر مشتری">
                                <input
                                    type="number"
                                    min="0"
                                    required
                                    value={form.maxCustomers}
                                    onChange={(e) => updateField("maxCustomers", e.target.value)}
                                    className={inputClass}
                                />
                            </Field>

                            <Field label="حداکثر لید">
                                <input
                                    type="number"
                                    min="0"
                                    required
                                    value={form.maxLeads}
                                    onChange={(e) => updateField("maxLeads", e.target.value)}
                                    className={inputClass}
                                />
                            </Field>

                            <Field label="حداکثر محصول">
                                <input
                                    type="number"
                                    min="0"
                                    required
                                    value={form.maxProducts}
                                    onChange={(e) => updateField("maxProducts", e.target.value)}
                                    className={inputClass}
                                />
                            </Field>

                            <Field label="حداکثر پیام AI">
                                <input
                                    type="number"
                                    min="0"
                                    required
                                    value={form.maxAiMessages}
                                    onChange={(e) => updateField("maxAiMessages", e.target.value)}
                                    className={inputClass}
                                />
                            </Field>

                            <Field label="توضیحات">
                                <textarea
                                    value={form.description}
                                    onChange={(e) => updateField("description", e.target.value)}
                                    className={inputClass}
                                    rows={2}
                                />
                            </Field>

                            <label className="flex items-center gap-3 text-sm font-medium self-center">
                                <input
                                    type="checkbox"
                                    checked={form.isPopular}
                                    onChange={(e) => updateField("isPopular", e.target.checked)}
                                    className="h-4 w-4 accent-emerald-700"
                                />
                                پلن محبوب‌ترین باشد
                            </label>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                className="h-11 px-5 rounded-xl border border-slate-200 font-bold text-sm"
                            >
                                انصراف
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="h-11 px-5 rounded-xl bg-brand-600 text-white font-bold text-sm disabled:opacity-50 flex items-center gap-2"
                            >
                                {saving && <Loader2 size={16} className="animate-spin" />}
                                {saving
                                    ? "در حال ذخیره..."
                                    : editing
                                        ? "اعمال ویرایش‌ها"
                                        : "ساخت پلن"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </Shell>
    );
}

const inputClass =
    "w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-600 bg-white";

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
        <label className="block space-y-1.5 text-sm font-bold text-slate-700">
            <span>
                {label}
                {required && <span className="text-red-500"> *</span>}
            </span>
            {children}
        </label>
    );
}
