"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Bot,
  Building2,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Globe2,
  Loader2,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Package,
  Phone,
  Save,
  ShieldCheck,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { api } from "@/lib/api";

type Business = {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type OwnerUser = {
  id: string;
  tenantId?: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role?: string;
  isEmailVerified?: boolean;
  lastLogin?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type Owner = {
  id: string;
  tenantId: string;
  user: OwnerUser;
  createdAt: string;
  updatedAt: string;
} | null;

type SubscriptionPlan = {
  id: string;
  name: string;
  price: string;
  billingInterval: string;
};

type Subscription = {
  id?: string;
  status?: string;
  startsAt?: string;
  expiresAt?: string;
  plan?: SubscriptionPlan;
} | null;

type Overview = {
  business: Business;
  owner: Owner;
  team: {
    total: number;
  };
  subscription: Subscription;
  statistics: {
    sites: number;
    customers: number;
    leads: number;
    conversations: number;
    products: number;
    knowledgeItems: number;
    agents: number;
  };
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "فعال",
  SUSPENDED: "معلق",
  DEACTIVATED: "غیرفعال",
};

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-[#EAF7F1] text-[#25825A]",
  SUSPENDED: "bg-[#FFF4E5] text-[#A66A17]",
  DEACTIVATED: "bg-[#F1F3F3] text-[#7A8785]",
};

const fa = (value: number) => value.toLocaleString("fa-IR");

const tabs = [
  ["overview", "Overview"],
  ["subscription", "اشتراک"],
  ["team", "تیم"],
  ["sites", "Sites"],
  ["agent", "AI Agent"],
  ["activity", "Activity"],
] as const;

function Status({ value }: { value: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
        STATUS_STYLES[value] ||
        "bg-[#F1F3F3] text-[#7A8785]"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {STATUS_LABELS[value] || value}
    </span>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: number;
}) {
  return (
    <div
      className="rounded-2xl border bg-white p-4"
      style={{ borderColor: "var(--line)" }}
    >
      <div className="flex items-center justify-between">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#E8F5F3] text-[#10706B]">
          <Icon size={18} />
        </div>

        <span className="text-xl font-black">
          {fa(value)}
        </span>
      </div>

      <div className="mt-3 text-xs font-bold text-[#687573]">
        {label}
      </div>
    </div>
  );
}

export default function BusinessDetails({
  id,
}: {
  id: string;
}) {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [tab, setTab] = useState("overview");

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [changingStatus, setChangingStatus] =
    useState(false);

  const [deleting, setDeleting] = useState(false);

  const [ownerLoading, setOwnerLoading] =
    useState(false);

  const [ownerEmail, setOwnerEmail] = useState("");

  const [ownerUserId, setOwnerUserId] =
    useState("");

  const [showActions, setShowActions] =
    useState(false);

  async function loadOverview() {
    try {
      setLoading(true);
      setError("");

      const response = await api<ApiResponse<Overview>>(
        `/admin/businesses/${id}/overview`
      );

      setData(response.data);

      setName(response.data.business.name);
      setSlug(response.data.business.slug);
      setEmail(response.data.business.email);
      setPhone(response.data.business.phone || "");

      if (response.data.owner?.user) {
        setOwnerEmail(response.data.owner.user.email);
        setOwnerUserId(response.data.owner.user.id);
      } else {
        setOwnerEmail("");
        setOwnerUserId("");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "دریافت اطلاعات Business ناموفق بود"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOverview();
  }, [id]);

  const daysLeft = useMemo(() => {
    if (!data?.subscription?.expiresAt) {
      return null;
    }

    return Math.max(
      0,
      Math.ceil(
        (new Date(
          data.subscription.expiresAt
        ).getTime() -
          Date.now()) /
          86400000
      )
    );
  }, [data]);

  async function saveBusiness() {
    try {
      setSaving(true);

      const response = await api<ApiResponse<Business>>(
        `/admin/businesses/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            name,
            slug,
            email,
            phone: phone || null,
          }),
        }
      );

      setData((current) =>
        current
          ? {
              ...current,
              business: response.data,
            }
          : current
      );

      setEditing(false);
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "ذخیره اطلاعات ناموفق بود"
      );
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(
    status:
      | "ACTIVE"
      | "SUSPENDED"
      | "DEACTIVATED"
  ) {
    try {
      setChangingStatus(true);

      const response = await api<ApiResponse<Business>>(
        `/admin/businesses/${id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status,
          }),
        }
      );

      setData((current) =>
        current
          ? {
              ...current,
              business: response.data,
            }
          : current
      );

      setShowActions(false);
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "تغییر وضعیت ناموفق بود"
      );
    } finally {
      setChangingStatus(false);
    }
  }

  async function deleteBusiness() {
    const confirmed = window.confirm(
      "آیا از حذف این کسب‌وکار مطمئن هستید؟ این عملیات قابل بازگشت نیست."
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);

      await api(
        `/admin/businesses/${id}`,
        {
          method: "DELETE",
        }
      );

      window.location.href = "/businesses";
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "حذف کسب‌وکار ناموفق بود"
      );
    } finally {
      setDeleting(false);
    }
  }

  async function loadOwner() {
    try {
      setOwnerLoading(true);

      const response = await api<ApiResponse<Owner>>(
        `/admin/businesses/${id}/owner`
      );

      if (response.data?.user) {
        setOwnerEmail(response.data.user.email);
        setOwnerUserId(response.data.user.id);
      } else {
        setOwnerEmail("");
        setOwnerUserId("");
      }
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "دریافت Owner ناموفق بود"
      );
    } finally {
      setOwnerLoading(false);
    }
  }

  async function removeOwner() {
    const confirmed = window.confirm(
      "Owner این کسب‌وکار حذف شود؟"
    );

    if (!confirmed) {
      return;
    }

    try {
      setOwnerLoading(true);

      await api(
        `/admin/businesses/${id}/owner`,
        {
          method: "DELETE",
        }
      );

      setOwnerEmail("");
      setOwnerUserId("");

      await loadOverview();
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "حذف Owner ناموفق بود"
      );
    } finally {
      setOwnerLoading(false);
    }
  }

  async function assignOwner() {
    if (!ownerUserId.trim()) {
      alert("شناسه User را وارد کنید.");
      return;
    }

    try {
      setOwnerLoading(true);

      await api(
        `/admin/businesses/${id}/owner`,
        {
          method: "PATCH",
          body: JSON.stringify({
            userId: ownerUserId.trim(),
          }),
        }
      );

      await loadOverview();
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "تعیین Owner ناموفق بود"
      );
    } finally {
      setOwnerLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-8 w-52 animate-pulse rounded-lg bg-[#E8ECEB]" />

        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map(
            (_, i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-2xl bg-white"
              />
            )
          )}
        </div>

        <div className="h-96 animate-pulse rounded-2xl bg-white" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div
        className="rounded-2xl border bg-white p-8 text-center"
        style={{ borderColor: "var(--line)" }}
      >
        <AlertCircle
          className="mx-auto text-red-500"
          size={30}
        />

        <h2 className="mt-3 font-black">
          دریافت اطلاعات Business ناموفق بود
        </h2>

        <p className="mt-2 text-sm text-[#687573]">
          {error || "اطلاعاتی پیدا نشد."}
        </p>

        <button
          onClick={loadOverview}
          className="btn-primary mt-5"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  const business = data.business;
  const stats = data.statistics;

  const ownerName = data.owner?.user
    ? [
        data.owner.user.firstName,
        data.owner.user.lastName,
      ]
        .filter(Boolean)
        .join(" ")
    : "";

  return (
    <div className="space-y-5">
      {/* Back */}
      <button
        onClick={() => window.history.back()}
        className="inline-flex items-center gap-2 text-xs font-bold text-[#687573] hover:text-[#10706B]"
      >
        <ArrowRight size={16} />
        بازگشت به کسب‌وکارها
      </button>

      {/* Header */}
      <section
        className="rounded-3xl border bg-white p-5 lg:p-7"
        style={{ borderColor: "var(--line)" }}
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[#071F1E] text-white">
              <Building2 size={27} />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-black tracking-tight">
                  {business.name}
                </h1>

                <Status value={business.status} />
              </div>

              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#71807E]">
                <span className="inline-flex items-center gap-1.5">
                  <Globe2 size={14} />
                  {business.slug}
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <Mail size={13} />
                  {business.email}
                </span>

                {business.phone && (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone size={13} />
                    {business.phone}
                  </span>
                )}

                <span>
                  ایجاد شده{" "}
                  {new Date(
                    business.createdAt
                  ).toLocaleDateString("fa-IR")}
                </span>
              </div>
            </div>
          </div>

          <div className="relative flex gap-2">
            <button
              onClick={() =>
                setEditing(true)
              }
              className="btn-ghost"
            >
              ویرایش
            </button>

            <button
              onClick={() =>
                setShowActions(
                  (current) => !current
                )
              }
              className="btn-ghost"
            >
              <MoreHorizontal size={17} />
              اقدامات
            </button>

            {showActions && (
              <div className="absolute left-0 top-12 z-30 w-52 rounded-2xl border border-[#E4EAE8] bg-white p-2 shadow-xl">
                <button
                  disabled={changingStatus}
                  onClick={() =>
                    changeStatus("ACTIVE")
                  }
                  className="w-full rounded-xl px-3 py-2.5 text-right text-xs font-bold hover:bg-[#F4F8F7]"
                >
                  فعال کردن
                </button>

                <button
                  disabled={changingStatus}
                  onClick={() =>
                    changeStatus("SUSPENDED")
                  }
                  className="w-full rounded-xl px-3 py-2.5 text-right text-xs font-bold hover:bg-[#F4F8F7]"
                >
                  معلق کردن
                </button>

                <button
                  disabled={changingStatus}
                  onClick={() =>
                    changeStatus("DEACTIVATED")
                  }
                  className="w-full rounded-xl px-3 py-2.5 text-right text-xs font-bold hover:bg-[#F4F8F7]"
                >
                  غیرفعال کردن
                </button>

                <div className="my-1 border-t border-[#EEF2F1]" />

                <button
                  disabled={deleting}
                  onClick={deleteBusiness}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-right text-xs font-bold text-red-500 hover:bg-red-50"
                >
                  <Trash2 size={14} />
                  حذف کسب‌وکار
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          icon={Users}
          label="مشتریان"
          value={stats.customers}
        />

        <Stat
          icon={UserRound}
          label="Leads"
          value={stats.leads}
        />

        <Stat
          icon={MessageSquare}
          label="مکالمات"
          value={stats.conversations}
        />

        <Stat
          icon={Bot}
          label="AI Agents"
          value={stats.agents}
        />
      </div>

      {/* Tabs */}
      <div
        className="overflow-x-auto border-b"
        style={{ borderColor: "var(--line)" }}
      >
        <div className="flex min-w-max gap-1">
          {tabs.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`relative px-4 py-3 text-xs font-black transition ${
                tab === key
                  ? "text-[#10706B]"
                  : "text-[#788482] hover:text-[#071F1E]"
              }`}
            >
              {label}

              {tab === key && (
                <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-[#10706B]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div className="grid gap-5 xl:grid-cols-[1.4fr_.9fr]">
          <div className="space-y-5">
            <section className="panel p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-black">
                    وضعیت سرویس‌ها
                  </h2>

                  <p className="mt-1 text-xs text-[#71807E]">
                    نمای کلی منابع این Business
                  </p>
                </div>

                <ShieldCheck
                  size={19}
                  className="text-[#10706B]"
                />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Stat
                  icon={Globe2}
                  label="Sites"
                  value={stats.sites}
                />

                <Stat
                  icon={Package}
                  label="Products"
                  value={stats.products}
                />

                <Stat
                  icon={BookOpen}
                  label="Knowledge Base"
                  value={stats.knowledgeItems}
                />

                <Stat
                  icon={Bot}
                  label="AI Agents"
                  value={stats.agents}
                />
              </div>
            </section>

            <section className="panel p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-black">
                  اطلاعات کسب‌وکار
                </h2>

                <Building2
                  size={18}
                  className="text-[#10706B]"
                />
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <InfoItem
                  label="نام"
                  value={business.name}
                />

                <InfoItem
                  label="Slug"
                  value={business.slug}
                />

                <InfoItem
                  label="ایمیل"
                  value={business.email}
                />

                <InfoItem
                  label="تلفن"
                  value={
                    business.phone || "—"
                  }
                />
              </div>
            </section>
          </div>

          <div className="space-y-5">
            <SubscriptionCard
              subscription={data.subscription}
              daysLeft={daysLeft}
            />

            <section className="panel p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-black">
                  Owner
                </h2>

                <Users
                  size={18}
                  className="text-[#10706B]"
                />
              </div>

              {data.owner ? (
                <div className="mt-4 rounded-2xl bg-[#F7F9F8] p-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-full bg-[#E8F5F3] font-black text-[#10706B]">
                      {(ownerName ||
                        data.owner.user.email ||
                        "O")[0].toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <div className="text-sm font-black">
                        {ownerName ||
                          "Business Owner"}
                      </div>

                      <div className="mt-1 truncate text-[10px] text-[#71807E]">
                        {data.owner.user.email}
                      </div>

                      <div className="mt-1 text-[10px] text-[#9AA5A3]">
                        {data.owner.user.role ||
                          "ADMIN"}
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={ownerLoading}
                    onClick={removeOwner}
                    className="mt-4 w-full rounded-xl border border-red-100 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50"
                  >
                    حذف Owner
                  </button>
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-dashed p-5">
                  <p className="text-xs font-bold">
                    Owner تعیین نشده
                  </p>

                  <input
                    value={ownerUserId}
                    onChange={(e) =>
                      setOwnerUserId(
                        e.target.value
                      )
                    }
                    placeholder="User ID"
                    className="mt-3 w-full rounded-xl border border-[#E1E7E5] px-3 py-2.5 text-xs outline-none focus:border-[#10706B]"
                  />

                  <button
                    disabled={ownerLoading}
                    onClick={assignOwner}
                    className="btn-primary mt-3 w-full"
                  >
                    {ownerLoading
                      ? "در حال ذخیره..."
                      : "تعیین Owner"}
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
      )}

      {/* Subscription */}
      {tab === "subscription" && (
        <SubscriptionCard
          subscription={data.subscription}
          daysLeft={daysLeft}
          large
        />
      )}

      {/* Team */}
      {tab === "team" && (
        <section className="panel p-8">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#E8F5F3] text-[#10706B]">
              <Users size={22} />
            </div>

            <div>
              <h2 className="font-black">
                اعضای تیم
              </h2>

              <p className="mt-1 text-xs text-[#71807E]">
                تعداد اعضای این Business
              </p>
            </div>
          </div>

          <div className="mt-6 text-3xl font-black text-[#0B2B29]">
            {fa(data.team.total)}
          </div>

          <div className="mt-1 text-xs text-[#71807E]">
            عضو ثبت شده
          </div>
        </section>
      )}

      {/* Sites */}
      {tab === "sites" && (
        <section className="panel p-8">
          <div className="text-center">
            <Globe2
              className="mx-auto text-[#10706B]"
              size={30}
            />

            <h2 className="mt-4 text-lg font-black">
              Sites
            </h2>

            <p className="mt-2 text-sm text-[#71807E]">
              این Business دارای{" "}
              <strong>
                {fa(stats.sites)}
              </strong>{" "}
              Site است.
            </p>
          </div>
        </section>
      )}

      {/* Agent */}
      {tab === "agent" && (
        <section className="panel p-8">
          <div className="text-center">
            <Bot
              className="mx-auto text-[#10706B]"
              size={30}
            />

            <h2 className="mt-4 text-lg font-black">
              AI Agent
            </h2>

            <p className="mt-2 text-sm text-[#71807E]">
              تعداد AI Agentهای این Business:{" "}
              <strong>
                {fa(stats.agents)}
              </strong>
            </p>
          </div>
        </section>
      )}

      {/* Activity */}
      {tab === "activity" && (
        <section className="panel p-8">
          <div className="text-center">
            <ShieldCheck
              className="mx-auto text-[#10706B]"
              size={30}
            />

            <h2 className="mt-4 text-lg font-black">
              Activity
            </h2>

            <p className="mt-2 text-sm text-[#71807E]">
              API فعالیت‌ها هنوز در Backend این
              Business تعریف نشده است.
            </p>
          </div>
        </section>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black">
                  ویرایش کسب‌وکار
                </h2>

                <p className="mt-1 text-xs text-[#71807E]">
                  اطلاعات Business را تغییر دهید.
                </p>
              </div>

              <button
                onClick={() =>
                  setEditing(false)
                }
                className="grid h-9 w-9 place-items-center rounded-xl bg-[#F3F6F5] text-[#687573]"
              >
                <X size={17} />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <Input
                label="نام کسب‌وکار"
                value={name}
                onChange={setName}
              />

              <Input
                label="Slug"
                value={slug}
                onChange={setSlug}
              />

              <Input
                label="ایمیل"
                value={email}
                onChange={setEmail}
                type="email"
              />

              <Input
                label="تلفن"
                value={phone}
                onChange={setPhone}
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() =>
                  setEditing(false)
                }
                className="btn-ghost flex-1"
              >
                انصراف
              </button>

              <button
                disabled={saving}
                onClick={saveBusiness}
                className="btn-primary flex-1"
              >
                {saving ? (
                  <>
                    <Loader2
                      size={15}
                      className="animate-spin"
                    />
                    ذخیره...
                  </>
                ) : (
                  <>
                    <Save size={15} />
                    ذخیره تغییرات
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold text-[#4A5856]">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-xl border border-[#E1E7E5] bg-white px-3.5 py-3 text-xs font-medium text-[#0B2B29] outline-none transition focus:border-[#10706B] focus:ring-2 focus:ring-[#10706B]/10"
      />
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-[#F7F9F8] p-4">
      <div className="text-[10px] font-bold text-[#9AA5A3]">
        {label}
      </div>

      <div className="mt-1 break-all text-xs font-bold text-[#0B2B29]">
        {value}
      </div>
    </div>
  );
}

function SubscriptionCard({
  subscription,
  daysLeft,
  large = false,
}: {
  subscription: Subscription;
  daysLeft: number | null;
  large?: boolean;
}) {
  return (
    <section className={`panel p-5 ${large ? "min-h-[300px]" : ""}`}>
      <div className="flex items-center justify-between">
        <h2 className="font-black">
          Subscription
        </h2>

        <CreditCard
          size={18}
          className="text-[#10706B]"
        />
      </div>

      {subscription ? (
        <div className="mt-4 rounded-2xl bg-[#071F1E] p-5 text-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs text-white/60">
                CURRENT PLAN
              </div>

              <div className="mt-1 text-xl font-black">
                {subscription.plan?.name ||
                  "Plan"}
              </div>
            </div>

            <CheckCircle2 className="text-[#75D5CE]" />
          </div>

          <div className="mt-6 flex justify-between text-xs">
            <span className="text-white/60">
              وضعیت
            </span>

            <span>
              {subscription.status || "—"}
            </span>
          </div>

          {subscription.plan?.billingInterval && (
            <div className="mt-2 flex justify-between text-xs">
              <span className="text-white/60">
                دوره پرداخت
              </span>

              <span>
                {subscription.plan.billingInterval}
              </span>
            </div>
          )}

          {daysLeft !== null && (
            <div className="mt-2 flex justify-between text-xs">
              <span className="text-white/60">
                مانده
              </span>

              <span>
                {fa(daysLeft)} روز
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed p-8 text-center">
          <CreditCard
            className="mx-auto text-[#A3AEAC]"
            size={24}
          />

          <p className="mt-2 text-xs font-bold">
            اشتراک فعالی ندارد
          </p>
        </div>
      )}
    </section>
  );
}