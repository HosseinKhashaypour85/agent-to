"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import {
  LayoutDashboard,
  Users,
  MessageCircle,
  TrendingUp,
  Target,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

const navigation = [
  { name: "داشبورد", href: "/", icon: LayoutDashboard },
  { name: "مشتریان", href: "/customers", icon: Users },
  { name: "مکالمات", href: "/conversations", icon: MessageCircle },
  { name: "امتیاز لیدها", href: "/lead-scores", icon: TrendingUp },
  { name: "لیدها", href: "/leads", icon: Target },
  { name: "تنظیمات", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed right-0 top-0 h-screen bg-white border-l border-gray-200 z-40 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className={cn("flex items-center justify-between h-16 px-4 border-b border-gray-100", collapsed && "justify-center")}>
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                <span className="text-white font-bold text-lg">ا</span>
              </div>
              <span className="font-bold text-lg text-gray-900">AGENT-TO</span>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors",
              collapsed && "ml-2"
            )}
            aria-label={collapsed ? "باز کردن منو" : "بستن منو"}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="منوی اصلی">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  "group",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                  collapsed && "justify-center"
                )}
                title={collapsed ? item.name : undefined}
              >
                <Icon size={20} className="flex-shrink-0" aria-hidden="true" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-gray-100">
          <button className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors",
            collapsed && "justify-center"
          )}>
            <LogOut size={20} className="flex-shrink-0" aria-hidden="true" />
            {!collapsed && <span>خروج</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}