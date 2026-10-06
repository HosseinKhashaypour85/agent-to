"use client";

import { Bell, Search, User, Menu, Sun, Moon, LogOut } from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";

export function Header() {
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <button className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100" aria-label="باز کردن منو">
            <Menu size={24} />
          </button>

          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="جستجوی مشتری، مکالمه، لید..."
              className="w-72 pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label={darkMode ? "حالت روشن" : "حالت تاریک"}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="اعلان‌ها"
              aria-expanded={notificationsOpen}
            >
              <Bell size={24} />
              <span className="absolute top-1 left-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
            </button>

            {notificationsOpen && (
              <div className="absolute left-0 mt-2 w-80 bg-white rounded-xl border border-gray-200 shadow-lg py-2 animate-scale-in">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">اعلان‌ها</h3>
                  <span className="text-sm text-gray-500">۳ مورد</span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {[
                    { title: "لید جدید داغ", desc: "علی رضایی امتیاز ۹۱ دریافت کرد", time: "۱۰ دقیقه پیش" },
                    { title: "مکالمه جدید", desc: "مکالمه با محمد احمادی آغاز شد", time: "۲۵ دقیقه پیش" },
                    { title: "امتیاز به‌روزرسانی شد", desc: "امتیاز سارا کریمی از ۷۴ به ۸۷ افزایش یافت", time: "۱ ساعت پیش" },
                  ].map((notif, i) => (
                    <div key={i} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0">
                      <p className="font-medium text-gray-900">{notif.title}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{notif.desc}</p>
                      <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 border-t border-gray-100">
                  <button className="w-full text-center text-primary text-sm font-medium hover:text-primary-dark">
                    مشاهده همه
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
              aria-label="منوی کاربر"
              aria-expanded={userMenuOpen}
            >
              <Avatar firstName="احمد" lastName="مدیری" size="md" />
              <span className="hidden sm:block font-medium text-gray-700">احمد مدیری</span>
            </button>

            {userMenuOpen && (
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-xl border border-gray-200 shadow-lg py-2 animate-scale-in">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="font-medium text-gray-900">احمد مدیری</p>
                  <p className="text-sm text-gray-500">مدیر سیستم</p>
                </div>
                <button className="w-full px-4 py-2 text-right text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                  <User size={18} />
                  پروفایل
                </button>
                <button className="w-full px-4 py-2 text-right text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                  <Sun size={18} />
                  تنظیمات نمایش
                </button>
                <hr className="my-2 border-gray-100" />
                <button className="w-full px-4 py-2 text-right text-sm text-red-500 hover:bg-red-50 flex items-center gap-2">
                  <LogOut size={18} />
                  خروج
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}