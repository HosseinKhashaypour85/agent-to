"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { crmApi } from "@/lib/api";
import type { Conversation } from "@/lib/types";
import { formatDate, getChannelIcon, getChannelLabel } from "@/lib/utils";
import { MessageCircle, Search, Filter, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import Link from "next/link";

interface ConversationsPageProps {
  searchParams: Promise<{ page?: string; channel?: string }>;
}

async function getConversations(page = 1) {
  try {
    // This would need a proper API endpoint - using mock for now
    return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
  } catch {
    return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
  }
}

function ConversationRow({ conversation }: { conversation: Conversation }) {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center">
            <span className="text-lg">{getChannelIcon(conversation.channel)}</span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{getChannelLabel(conversation.channel)}</p>
            <p className="text-sm text-gray-500">ID: {conversation.id.slice(0, 8)}...</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <Badge variant={conversation.status === "OPEN" ? "green" : "gray"} size="sm">
          {conversation.status === "OPEN" ? "باز" : "بسته"}
        </Badge>
      </td>
      <td className="px-4 py-4 text-sm text-gray-500">
        {formatDate(conversation.createdAt, { jalali: true, time: true })}
      </td>
      <td className="px-4 py-4 text-sm text-gray-500">
        {formatDate(conversation.updatedAt, { jalali: true, time: true })}
      </td>
      <td className="px-4 py-4">
        <Link href={`/conversations/${conversation.id}`} className="text-primary hover:text-primary-dark font-medium text-sm">
          مشاهده
        </Link>
      </td>
    </tr>
  );
}

function ConversationTable({ conversations, loading }: { conversations: Conversation[]; loading?: boolean }) {
  if (loading) {
    return <div className="space-y-4">{[1,2,3,4,5].map(i => <div key={i} className="skeleton h-16 rounded-xl animate-pulse" />)}</div>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">مکالمه</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">وضعیت</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">شروع</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">آخرین فعالیت</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">عملیات</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {conversations.length > 0 ? conversations.map(c => <ConversationRow key={c.id} conversation={c} />) : (
            <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-500">مکالمه‌ای یافت نشد</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (page: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <Button variant="secondary" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1}><ChevronRight size={18} /></Button>
      <div className="flex items-center gap-1">
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          let pageNum = totalPages <= 5 ? i + 1 : currentPage <= 3 ? i + 1 : currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i;
          return <button key={pageNum} onClick={() => onPageChange(pageNum)} className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${pageNum === currentPage ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100"}`}>{pageNum}</button>;
        })}
      </div>
      <Button variant="secondary" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages}><ChevronLeft size={18} /></Button>
    </div>
  );
}

export default async function ConversationsPage({ searchParams }: ConversationsPageProps) {
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || "1", 10);
  const data = await getConversations(page);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MessageCircle size={24} className="text-primary" />
              مکالمات
            </h1>
            <p className="text-gray-500 mt-1">مشاهده و مدیریت تمام مکالمات</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="p-4 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input type="text" placeholder="جستجوی مکالمات..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
                <Button variant="secondary" size="sm"><Filter size={18} /> فیلترها</Button>
              </div>
            </div>

            <ConversationTable conversations={data.data} loading={false} />

            {data.pagination.total > 0 && (
              <div className="px-4 py-4 border-t border-gray-100">
                <Pagination currentPage={data.pagination.page} totalPages={data.pagination.totalPages} onPageChange={p => window.location.href = `/conversations?page=${p}`} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}