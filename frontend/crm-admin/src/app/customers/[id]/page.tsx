"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { LeadScoreCard } from "@/components/crm/LeadScoreCard";
import { ConversationTimeline } from "@/components/crm/ConversationTimeline";
import { CustomerTimeline } from "@/components/crm/CustomerTimeline";
import { crmApi } from "@/lib/api";
import type { Customer, LeadScore, CustomerConversationSummary, TimelineEvent } from "@/lib/types";
import { formatDate, getInitials, getChannelIcon, getChannelLabel } from "@/lib/utils";
import { ArrowLeft, MessageCircle, TrendingUp, Clock, MapPin, Phone, Mail, User, RefreshCw, ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";

interface CustomerDetailPageProps {
  params: Promise<{ id: string }>;
}

async function getCustomerData(customerId: string) {
  try {
    const [profileRes, leadScoreRes] = await Promise.all([
      crmApi.getCustomerProfile(customerId),
      crmApi.getLeadScore(customerId),
    ]);
    return {
      profile: profileRes.success ? profileRes.data : null,
      leadScore: leadScoreRes.success ? leadScoreRes.data : null,
    };
  } catch {
    return { profile: null, leadScore: null };
  }
}

function CustomerProfileHeader({ customer, leadScore }: { customer: Customer; leadScore: LeadScore | null }) {
  const name = `${customer.firstName || ""} ${customer.lastName || ""}`.trim() || "بدون نام";
  const tempColor = leadScore ? getTemperatureColor(leadScore.temperature) : "gray";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-6 p-6 bg-gradient-to-br from-primary to-primary-dark rounded-2xl text-white">
      <Avatar
        firstName={customer.firstName}
        lastName={customer.lastName}
        size="xl"
        className="bg-white/20 border-2 border-white/30"
      />
      <div className="flex-1 text-center sm:text-right">
        <div className="flex items-center justify-center sm:justify-end gap-2 mb-2">
          <h1 className="text-2xl font-bold">{name}</h1>
          {leadScore && (
            <Badge variant={leadScore.temperature.toLowerCase() as "hot" | "warm" | "cold"} size="lg">
              {leadScore.score} / 100
            </Badge>
          )}
        </div>
        <p className="text-primary-light mb-4">
          {leadScore
            ? leadScore.temperature === "HOT"
              ? "این مشتری احتمال خرید بالایی دارد"
              : leadScore.temperature === "WARM"
              ? "مشتری علاقه‌مند است، نیاز به پیگیری دارد"
              : "فعلاً نشانه خرید قوی ندارد"
            : "امتیاز لید محاسبه نشده"}
        </p>
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-4 text-sm">
          {customer.phone && (
            <span className="flex items-center gap-1">
              <Phone size={16} /> {customer.phone}
            </span>
          )}
          {customer.email && (
            <span className="flex items-center gap-1">
              <Mail size={16} /> {customer.email}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock size={16} />
            عضو از {formatDate(customer.createdAt, { jalali: true })}
          </span>
        </div>
      </div>
    </div>
  );
}

function ConversationDetailModal({ 
  conversation, 
  onClose 
}: { 
  conversation: CustomerConversationSummary; 
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[80vh] flex flex-col animate-scale-in">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-2l">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center">
              <span className="text-xl">{getChannelIcon(conversation.channel)}</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{getChannelLabel(conversation.channel)}</h3>
              <p className="text-sm text-gray-500">
                {formatDate(conversation.createdAt, { jalali: true, time: true })} · {conversation.messageCount} پیام
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100">
            <ChevronDown size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="text-center text-gray-500 py-8">
            <MessageCircle className="mx-auto text-gray-300 mb-3" size={32} />
            <p>برای مشاهده پیام‌ها، از منوی مکالمات استفاده کنید</p>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>بستن</Button>
          <Button>
            <MessageCircle size={18} />
            مشاهده مکالمه کامل
          </Button>
        </div>
      </div>
    </div>
  );
}

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { id } = await params;
  const data = await getCustomerData(id);

  if (!data.profile) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h1 className="text-xl font-medium text-gray-900 mb-2">مشتری یافت نشد</h1>
          <Link href="/customers" className="text-primary hover:underline">بازگشت به لیست مشتریان</Link>
        </div>
      </DashboardLayout>
    );
  }

  const { profile, leadScore } = data;
  const [selectedConversation, setSelectedConversation] = useState<CustomerConversationSummary | null>(null);
  const [timelinePage, setTimelinePage] = useState(1);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  const loadTimeline = async (page = 1) => {
    setLoadingTimeline(true);
    try {
      const res = await crmApi.getCustomerTimeline(id, page, 50);
      if (res.success && res.data) {
        if (page === 1) {
          setTimelineEvents(res.data.data);
        } else {
          setTimelineEvents(prev => [...prev, ...res.data!.data]);
        }
      }
    } catch (error) {
      console.error("Failed to load timeline:", error);
    } finally {
      setLoadingTimeline(false);
    }
  };

  const handleRecalculate = async () => {
    try {
      await crmApi.calculateLeadScore(id);
      window.location.reload();
    } catch (error) {
      console.error("Failed to recalculate:", error);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
        {/* Back Button */}
        <Link href="/customers" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm">
          <ArrowLeft size={20} />
          بازگشت به لیست
        </Link>

        {/* Customer Profile Header */}
        <CustomerProfileHeader customer={profile.customer} leadScore={leadScore} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Lead Score & Info */}
          <div className="lg:col-span-1 space-y-6">
            <LeadScoreCard 
              leadScore={leadScore} 
              customerId={id} 
              onRecalculate={handleRecalculate} 
            />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User size={20} />
                  اطلاعات مشتری
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {profile.customer.phone && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                      <Phone className="text-gray-400" size={20} />
                      <div>
                        <p className="text-xs text-gray-500">تلفن</p>
                        <p className="font-medium text-gray-900">{profile.customer.phone}</p>
                      </div>
                    </div>
                  )}
                  {profile.customer.email && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                      <Mail className="text-gray-400" size={20} />
                      <div>
                        <p className="text-xs text-gray-500">ایمیل</p>
                        <p className="font-medium text-gray-900">{profile.customer.email}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                    <MapPin className="text-gray-400" size={20} />
                    <div>
                      <p className="text-xs text-gray-500">تاریخ عضویت</p>
                      <p className="font-medium text-gray-900">{formatDate(profile.customer.createdAt, { jalali: true })}</p>
                    </div>
                  </div>
                  {profile.customer.telegramId && profile.customer.telegramId !== "" && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                      <MessageCircle className="text-blue-500" size={20} />
                      <div>
                        <p className="text-xs text-gray-500">تلگرام</p>
                        <p className="font-medium text-gray-900">@{profile.customer.username || profile.customer.telegramId}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {profile.summary && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp size={20} />
                    خلاصه فعالیت
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-gray-50 text-center">
                      <p className="text-2xl font-bold text-primary">{profile.summary.totalConversations}</p>
                      <p className="text-xs text-gray-500">مکالمات</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-50 text-center">
                      <p className="text-2xl font-bold text-primary">{profile.summary.totalMessages}</p>
                      <p className="text-xs text-gray-500">پیام‌ها</p>
                    </div>
                  </div>
                  {profile.summary.channels.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-2">کانال‌ها</p>
                      <div className="flex flex-wrap gap-2">
                        {profile.summary.channels.map((ch) => (
                          <Badge key={ch} variant="blue" size="sm">{getChannelLabel(ch)}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {profile.summary.allIntents.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-2">نیت‌های شناسایی شده</p>
                      <div className="flex flex-wrap gap-2">
                        {profile.summary.allIntents.map((intent) => (
                          <Badge key={intent} variant="gray" size="sm">{intent}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Conversations & Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Conversations */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle size={20} />
                  تاریخچه مکالمات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ConversationTimeline
                  conversations={profile.conversations}
                  onSelect={setSelectedConversation}
                />
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock size={20} />
                  خط زمان مشتری
                </CardTitle>
                <Button variant="secondary" size="sm" onClick={() => loadTimeline(1)}>
                  <RefreshCw size={16} />
                  تازه‌سازی
                </Button>
              </CardHeader>
              <CardContent>
                <CustomerTimeline events={timelineEvents} loading={loadingTimeline} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Conversation Detail Modal */}
        {selectedConversation && (
          <ConversationDetailModal
            conversation={selectedConversation}
            onClose={() => setSelectedConversation(null)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}