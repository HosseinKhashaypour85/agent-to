"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { crmApi } from "@/lib/api";
import type { LeadScore } from "@/lib/types";
import { formatDate, getTemperatureColor } from "@/lib/utils";
import { TrendingUp, Filter, ChevronLeft, ChevronRight, Search } from "lucide-react";
import Link from "next/link";

interface LeadScoresPageProps {
  searchParams: Promise<{ page?: string; temperature?: string }>;
}

async function getLeadScores(page = 1, temperature?: string) {
  try {
    const temp = temperature as "HOT" | "WARM" | "COLD" | undefined;
    const res = temp ? await crmApi.getLeadsByTemperature(temp) : await crmApi.getLeadStats();
    if (temp) {
      return res.success ? { data: res.data || [], pagination: { page: 1, limit: 50, total: res.data?.length || 0, totalPages: 1 } } : { data: [], pagination: { page: 1, limit: 50, total: 0, totalPages: 1 } };
    }
    return { data: [], pagination: { page: 1, limit: 50, total: 0, totalPages: 1 }, stats: res.success ? res.data : null };
  } catch {
    return { data: [], pagination: { page: 1, limit: 50, total: 0, totalPages: 1 }, stats: null };
  }
}

function LeadScoreRow({ lead }: { lead: LeadScore }) {
  const customer = lead.customer;
  const name = customer ? `${customer.firstName || ""} ${customer.lastName || ""}`.trim() : "نامشخص";

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <Avatar firstName={customer?.firstName} lastName={customer?.lastName} size="md" />
          <div>
            <p className="font-medium text-gray-900">{name}</p>
            <p className="text-sm text-gray-500">{customer?.referralCode || "—"}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <Badge variant={lead.temperature.toLowerCase() as "hot" | "warm" | "cold"} size="md">
            {lead.score} / 100
          </Badge>
        </div>
      </td>
      <td className="px-4 py-4">
        <Badge variant={lead.temperature.toLowerCase() as "hot" | "warm" | "cold"} size="sm">
          {lead.temperature === "HOT" ? "داغ 🔥" : lead.temperature === "WARM" ? "گرم 🟡" : "سرد 🔵"}
        </Badge>
      </td>
      <td className="px-4 py-4">
        <div className="space-y-1 max-w-xs">
          {lead.reasons.slice(0, 2).map((reason, i) => (
            <p key={i} className="text-xs text-gray-600 truncate">• {reason}</p>
          ))}
          {lead.reasons.length > 2 && (
            <p className="text-xs text-gray-400">+{lead.reasons.length - 2} دلیل دیگر</p>
          )}
        </div>
      </td>
      <td className="px-4 py-4 text-sm text-gray-500">
        {formatDate(lead.lastCalculatedAt, { jalali: true, time: true })}
      </td>
      <td className="px-4 py-4">
        {customer && (
          <Link href={`/customers/${customer.id}`} className="text-primary hover:text-primary-dark font-medium text-sm">
            مشاهده
          </Link>
        )}
      </td>
    </tr>
  );
}

function LeadScoreTable({ leads, loading }: { leads: LeadScore[]; loading?: boolean }) {
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
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">مشتری</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">امتیاز</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">دما</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">دلایل</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">آخرین محاسبه</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">عملیات</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {leads.length > 0 ? (
            leads.map((lead) => <LeadScoreRow key={lead.id} lead={lead} />)
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
      <Button variant="secondary" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1}>
        <ChevronRight size={18} />
      </Button>
      <div className="flex items-center gap-1">
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          let pageNum;
          if (totalPages <= 5) pageNum = i + 1;
          else if (currentPage <= 3) pageNum = i + 1;
          else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
          else pageNum = currentPage - 2 + i;
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${
                pageNum === currentPage ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {pageNum}
            </button>
          );
        })}
      </div>
      <Button variant="secondary" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages}>
        <ChevronLeft size={18} />
      </Button>
    </div>
  );
}

export default async function LeadScoresPage({ searchParams }: LeadScoresPageProps) {
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || "1", 10);
  const temperature = resolvedParams.temperature || "";
  
  const data = await getLeadScores(page, temperature);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">امتیاز لیدها</h1>
            <p className="text-gray-500 mt-1">مشاهده و مدیریت امتیازهای لیدها</p>
          </div>
          <Button>محاسبه مجدد همه</Button>
        </div>

        {/* Stats Cards */}
        {data.stats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-sm text-gray-500">لیدهای داغ</p>
                <p className="text-3xl font-bold text-red-500 mt-1">{data.stats.hot}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-sm text-gray-500">لیدهای گرم</p>
                <p className="text-3xl font-bold text-amber-500 mt-1">{data.stats.warm}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-sm text-gray-500">لیدهای سرد</p>
                <p className="text-3xl font-bold text-blue-500 mt-1">{data.stats.cold}</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardContent className="p-0">
            <div className="p-4 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="جستجوی مشتری..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div className="flex items-center gap-2">
                  {["ALL", "HOT", "WARM", "COLD"].map((t) => (
                    <button
                      key={t}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        temperature === t || (t === "ALL" && !temperature)
                          ? "bg-primary text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                      onClick={() => {
                        const params = new URLSearchParams();
                        if (t !== "ALL") params.set("temperature", t);
                        window.location.href = `/lead-scores?${params.toString()}`;
                      }}
                    >
                      {t === "ALL" ? "همه" : t === "HOT" ? "داغ 🔥" : t === "WARM" ? "گرم 🟡" : "سرد 🔵"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <LeadScoreTable leads={data.data} loading={false} />

            {data.pagination.total > 0 && (
              <div className="px-4 py-4 border-t border-gray-100">
                <Pagination
                  currentPage={data.pagination.page}
                  totalPages={data.pagination.totalPages}
                  onPageChange={(p) => {
                    const params = new URLSearchParams();
                    params.set("page", p.toString());
                    if (temperature) params.set("temperature", temperature);
                    window.location.href = `/lead-scores?${params.toString()}`;
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}