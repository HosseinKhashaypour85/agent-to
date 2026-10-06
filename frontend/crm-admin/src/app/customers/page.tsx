"use client";

import { useState } from "react";
import { Suspense } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import Link from "next/link";
import { crmApi, customerApi } from "@/lib/api";
import type { Customer, PaginatedResponse } from "@/lib/types";
import { formatDate, getInitials } from "@/lib/utils";
import { Plus, Search, Filter, ChevronLeft, ChevronRight, MoreVertical } from "lucide-react";

interface CustomersPageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

async function getCustomers(page = 1, search = "") {
  try {
    const res = await customerApi.getCustomers(page, 20, search);
    return res.success ? res.data : { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
  } catch {
    return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
  }
}

function CustomerRow({ customer }: { customer: Customer }) {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <Avatar firstName={customer.firstName} lastName={customer.lastName} size="md" />
          <div>
            <p className="font-medium text-gray-900">
              {customer.firstName || ""} {customer.lastName || ""} || "بدون نام"
            </p>
            <p className="text-sm text-gray-500">{customer.referralCode}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="space-y-1">
          {customer.phone && <p className="text-sm text-gray-700">{customer.phone}</p>}
          {customer.email && <p className="text-sm text-gray-500">{customer.email}</p>}
          {!customer.phone && !customer.email && <p className="text-sm text-gray-400">—</p>}
        </div>
      </td>
      <td className="px-4 py-4">
        <Badge variant={customer.isActive ? "green" : "gray"} size="sm">
          {customer.isActive ? "فعال" : "غیرفعال"}
        </Badge>
      </td>
      <td className="px-4 py-4 text-sm text-gray-500">
        {formatDate(customer.createdAt, { jalali: true })}
      </td>
      <td className="px-4 py-4">
        <Link href={`/customers/${customer.id}`} className="text-primary hover:text-primary-dark font-medium">
          مشاهده
        </Link>
      </td>
    </tr>
  );
}

function CustomerTable({ customers, loading }: { customers: Customer[]; loading?: boolean }) {
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
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">تماس</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">وضعیت</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">تاریخ ثبت</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">عملیات</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {customers.length > 0 ? (
            customers.map((customer) => <CustomerRow key={customer.id} customer={customer} />)
          ) : (
            <tr>
              <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                مشتری‌ای یافت نشد
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
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <ChevronRight size={18} />
      </Button>
      <div className="flex items-center gap-1">
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          let pageNum;
          if (totalPages <= 5) {
            pageNum = i + 1;
          } else if (currentPage <= 3) {
            pageNum = i + 1;
          } else if (currentPage >= totalPages - 2) {
            pageNum = totalPages - 4 + i;
          } else {
            pageNum = currentPage - 2 + i;
          }
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${
                pageNum === currentPage
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {pageNum}
            </button>
          );
        })}
      </div>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        <ChevronLeft size={18} />
      </Button>
    </div>
  );
}

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || "1", 10);
  const search = resolvedParams.search || "";
  
  const data = await getCustomers(page, search);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">مشتریان</h1>
            <p className="text-gray-500 mt-1">مدیریت و مشاهده لیست مشتریان</p>
          </div>
          <Button>
            <Plus size={18} />
            مشتری جدید
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="p-4 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="جستجوی نام، تلفن، ایمیل..."
                    defaultValue={search}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const params = new URLSearchParams();
                        if (e.currentTarget.value) params.set("search", e.currentTarget.value);
                        window.location.href = `/customers?${params.toString()}`;
                      }
                    }}
                  />
                </div>
                <Button variant="secondary" size="sm">
                  <Filter size={18} />
                  فیلترها
                </Button>
              </div>
            </div>

            <CustomerTable customers={data.data} loading={false} />

            {data.pagination.total > 0 && (
              <div className="px-4 py-4 border-t border-gray-100">
                <Pagination
                  currentPage={data.pagination.page}
                  totalPages={data.pagination.totalPages}
                  onPageChange={(p) => {
                    const params = new URLSearchParams();
                    params.set("page", p.toString());
                    if (search) params.set("search", search);
                    window.location.href = `/customers?${params.toString()}`;
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