"use client";

import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { cn } from "@/lib/cn";

interface LayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 rtl">
      <Sidebar />
      <div className={cn("transition-all duration-300", "lg:ml-64")}>
        <Header />
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}