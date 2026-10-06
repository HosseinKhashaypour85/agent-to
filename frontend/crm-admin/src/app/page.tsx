"use client";

import { Suspense } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { LeadScoreCard } from "@/components/crm/LeadScoreCard";
import { ConversationTimeline } from "@/components/crm/ConversationTimeline";
import { CustomerTimeline } from "@/components/crm/CustomerTimeline";
import { crmApi } from "@/lib/api";
import type { LeadScoreStats, LeadScore, CustomerConversationSummary, TimelineEvent } from "@/lib/types";
import {
  TrendingUp, Users, MessageCircle, Target, AlertCircle,
  ChevronRight, Tag, Package, Truck, CreditCard, ShoppingCart
} from "lucide-react";
import { formatDate, getChannelIcon, getChannelLabel, getTemperatureColor, truncateText } from "@/lib/utils";

async function getDashboardData() {
  try {
    const [statsRes, hotLeadsRes] = await Promise.all([
      crmApi.getLeadStats(),
      crmApi.getLeadsByTemperature("HOT"),
    ]);
    return {
      stats: statsRes.success ? statsRes.data : null,
      hotLeads: hotLeadsRes.success ? hotLeadsRes.data : [],
    };
  } catch {
    return { stats: null, hotLeads: [] };
  }
}

function StatCard({ title, value, icon: Icon, color, trend }: { 
  title: string; 
  value: number | string; 
  icon: React.ComponentType<{ size?: number }>;
  color: string;
  trend?: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {trend && <p className="text-sm text-green-500 mt-1">{trend}</p>}
          </div>
          <div className={cn("p-3 rounded-xl", color + "/10")}>
            <Icon size={24} className={color} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function HotLeadCard({ lead }: { lead: LeadScore }) {
  const customer = lead.customer;
  const name = `${customer?.firstName || ""} ${customer?.lastName || ""}`.trim() || "نامشخص";
  const tempColor = getTemperatureColor(lead.temperature);

  return (
    <div className="p-4 rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer">
      <div className="flex items-center gap-3">
        <Avatar firstName={customer?.firstName} lastName={customer?.lastName} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-900 truncate">{name}</h4>
            <Badge variant={lead.temperature.toLowerCase() as "hot" | "warm" | "cold"} size="sm">
              {lead.score}/100
            </Badge>
          </div>
          <p className="text-sm text-gray-500 truncate">
            {customer?.phone || customer?.email || "بدون اطلاعات تماس"}
          </p>
        </div>
        <TrendingUp className="text-primary" size={20} />
      </div>
    </div>
  );
}

function RecentConversationCard({ conv }: { conv: CustomerConversationSummary }) {
  const intents = conv.detectedIntents.slice(0, 2);
  
  return (
    <div className="p-4 rounded-xl border border-gray-200 hover:border-primary/30 transition-all">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0">
          <span className="text-lg">{getChannelIcon(conv.channel)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">{getChannelLabel(conv.channel)}</span>
              <Badge variant="gray" size="sm">{conv.status === "OPEN" ? "باز" : "بسته"}</Badge>
            </div>
            <span className="text-xs text-gray-400">{formatDate(conv.createdAt, { jalali: true, time: true })}</span>
          </div>
          {intents.length > 0 && (
            <div className="mt-2 flex items-center gap-1.5">
              {intents.map((intent) => (
                <Badge key={intent} variant="blue" size="sm">{intent}</Badge>
              ))}
            </div>
          )}
          {conv.lastMessage && (
            <p className="mt-2 text-sm text-gray-500 line-clamp-1">{truncateText(conv.lastMessage, 150)}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">داشبورد CRM</h1>
            <p className="text-gray-500 mt-1">نمای کلی هوش تجاری و لیدها</p>
          </div>
          <Button>خروجی اکسل</Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="لیدهای داغ"
            value={data.stats?.hot || 0}
            icon={AlertCircle}
            color="text-red-500"
            trend={data.stats && `گرم: ${data.stats.warm} · سرد: ${data.stats.cold}`}
          />
          <StatCard
            title="مجموع لیدها"
            value={(data.stats?.hot || 0) + (data.stats?.warm || 0) + (data.stats?.cold || 0)}
            icon={Target}
            color="text-primary"
          />
          <StatCard
            title="مکالمات امروز"
            value="—"
            icon={MessageCircle}
            color="text-blue-500"
          />
          <StatCard
            title="مشتریان فعال"
            value="—"
            icon={Users}
            color="text-green-500"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Lead Intelligence */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hot Leads Widget */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="text-primary" size={20} />
                  مشتریان با احتمال خرید بالا
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.hotLeads.length > 0 ? (
                  data.hotLeads.slice(0, 5).map((lead) => (
                    <HotLeadCard key={lead.id} lead={lead} />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <TrendingUp className="mx-auto text-gray-300 mb-3" size={32} />
                    <p>لید داغی یافت نشد</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Conversations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="text-primary" size={20} />
                  مکالمات اخیر
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-center text-gray-500 py-8">برای مشاهده مکالمات، یک مشتری را انتخاب کنید</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Actions & Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>عملیات سریع</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start gap-3" variant="secondary">
                  <Users size={20} /> افزودن مشتری جدید
                </Button>
                <Button className="w-full justify-start gap-3" variant="secondary">
                  <MessageCircle size={20} /> شروع مکالمه جدید
                </Button>
                <Button className="w-full justify-start gap-3" variant="secondary">
                  <Target size={20} /> ایجاد لید دستی
                </Button>
                <Button className="w-full justify-start gap-3" variant="secondary">
                  <TrendingUp size={20} /> محاسبه امتیاز لیدها
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>توزیع دما</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { label: "داغ 🔥", count: data.stats?.hot || 0, color: "bg-red-500" },
                    { label: "گرم 🟡", count: data.stats?.warm || 0, color: "bg-amber-500" },
                    { label: "سرد 🔵", count: data.stats?.cold || 0, color: "bg-blue-500" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <span className="w-24 text-sm text-gray-600">{item.label}</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all duration-1000", item.color)}
                          style={{ width: `${data.stats ? (item.count / ((data.stats.hot + data.stats.warm + data.stats.cold) || 1)) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="w-12 text-sm font-medium text-gray-900 text-left">{item.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}