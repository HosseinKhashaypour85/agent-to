"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { crmApi } from "@/lib/api";
import type { Lead } from "@/lib/types";
import { formatDate, getLeadStatusLabel, getLeadStatusColor } from "@/lib/utils";
import { Plus, Search, Filter, ChevronLeft, ChevronRight, Target } from "lucide-react";
import Link from "next/link";

interface LeadsPageProps {
  searchParams: Promise<{ page?: string; status?: string }>;
}

async function getLeads(page = 1) {
  try {
    const res = await crmApi.getCustomers(page, 20);
    return res.success ? res.data : { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
  } catch {
    return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
  }
}

function LeadRow({ lead }: { lead: Lead }) {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-4">
        <p className="font-medium text-gray-900">{lead.title}</p>
        <p className="text-sm text-gray-500">{lead.description?.slice(0, 100) || "—"}</p>
      </td>
      <td className="px-4 py-4">
        <Badge variant={getLeadStatusColor(lead.status)} size="sm">
          {getLeadStatusLabel(lead.status)}
        </Badge>
      </td>
      <td className="px-4 py-4 text-sm text-gray-500">{lead.source}</td>
      <td className="px-4 py-4 text-sm text-gray-500">
        {lead.value ? `${lead.value.toLocaleString()} تومان` : "—"}
      </td>
      <td className="px-4 py-4 text-sm text-gray-500">
        {formatDate(lead.createdAt, { jalali: true })}
      </td>
      <td className="px-4 py-4">
        <Link href={`/customers/${lead.customerId}`} className="text-primary hover:text-primary-dark font-medium text-sm">
          مشاهده
        </Link>
      </td>
    </tr>
  );
}

function LeadTable({ leads, loading }: { leads: Lead[]; loading?: boolean }) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="skeleton h-16 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">عنوان</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">وضعیت</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">منبع</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">ارزش</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">تاریخ ایجاد</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">عملیات</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {leads.length > 0 ? (
            leads.map((lead) => <LeadRow key={lead.id} lead={lead} />)
          ) : (
            <tr>
              <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                لیدی یافت نشد
              </td>
            </tr>
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
          return (
            <button key={pageNum} onClick={() => onPageChange(pageNum)} className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${pageNum === currentPage ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100"}`}>
              {pageNum}
            </button>
          );
        })}
      </div>
      <Button variant="secondary" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages}><ChevronLeft size={18} /></Button>
    </div>
  );
}

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || "1", 10);
  
  const data = await getLeads(page);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Target size={24} className="text-primary" />
              لیدها
            </h1>
            <p className="text-gray-500 mt-1">مدیریت و پیگیری لیدهای فروش</p>
          </div>
          <Button><Plus size={18} /> لید جدید</Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="p-4 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input type="text" placeholder="جستجوی لیدها..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
                <Button variant="secondary" size="sm"><Filter size={18} /> فیلترها</Button>
              </div>
            </div>

            <LeadTable leads={data.data as any} loading={false} />

            {data.pagination.total > 0 && (
              <div className="px-4 py-4 border-t border-gray-100">
                <Pagination
                  currentPage={data.pagination.page}
                  totalPages={data.pagination.totalPages}
                  onPageChange={(p) => { window.location.href = `/leads?page=${p}`; }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}