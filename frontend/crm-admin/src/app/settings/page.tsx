"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { User, Bell, Shield, Palette, Database, LogOut, Save } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [saved, setSaved] = useState(false);

  const tabs = [
    { id: "profile", label: "پروفایل", icon: User },
    { id: "notifications", label: "اعلان‌ها", icon: Bell },
    { id: "security", label: "امنیت", icon: Shield },
    { id: "appearance", label: "نمایش", icon: Palette },
    { id: "integrations", label: "یکپارچگی", icon: Database },
  ];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">تنظیمات</h1>
          <p className="text-gray-500 mt-1">مدیریت تنظیمات حساب کاربری و سیستم</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <Card className="lg:w-64 flex-shrink-0">
            <CardContent className="p-2">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? "bg-primary text-white shadow-sm"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <Icon size={18} />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
              <div className="mt-6 pt-6 border-t border-gray-100">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
                  <LogOut size={18} />
                  خروج از حساب
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Content */}
          <div className="flex-1">
            {activeTab === "profile" && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>پروفایل کاربری</CardTitle>
                  <Button onClick={handleSave} disabled={saved}>
                    <Save size={18} />
                    {saved ? "ذخیره شد" : "ذخیره تغییرات"}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Input label="نام" defaultValue="احمد" />
                    <Input label="نام خانوادگی" defaultValue="مدیری" />
                    <Input label="ایمیل" type="email" defaultValue="ahmad@example.com" />
                    <Input label="تلفن" defaultValue="۰۹۱۲۳۴۵۶۷۸۹" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">تصویر پروفایل</label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-primary-light flex items-center justify-center overflow-hidden">
                        <span className="text-2xl font-bold text-primary">ام</span>
                      </div>
                      <Button variant="secondary">انتخاب فایل</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "notifications" && (
              <Card>
                <CardHeader><CardTitle>تنظیمات اعلان‌ها</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { title: "لیدهای جدید", desc: "اطلاع از ایجاد لیدهای جدید" },
                    { title: "امتیاز لید", desc: "وقتی امتیاز لید به‌روزرسانی شود" },
                    { title: "مکالمات جدید", desc: "شروع مکالمه جدید با مشتری" },
                    { title: "گزارش‌های روزانه", desc: "خلاصه فعالیت‌های روزانه" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-primary/30 transition-colors">
                      <div>
                        <p className="font-medium text-gray-900">{item.title}</p>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {activeTab === "security" && (
              <Card>
                <CardHeader><CardTitle>امنیت</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">تغییر رمز عبور</p>
                        <p className="text-sm text-gray-500">رمز عبور خود را به‌روزرسانی کنید</p>
                      </div>
                      <Button>تغییر رمز</Button>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">احراز هویت دو مرحله‌ای</p>
                        <p className="text-sm text-gray-500">افزودن لایه امنیتی اضافی</p>
                      </div>
                      <Button variant="secondary">فعال‌سازی</Button>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">جلسات فعال</p>
                        <p className="text-sm text-gray-500">مدیریت دستگاه‌های وارد شده</p>
                      </div>
                      <Button variant="ghost" size="sm">مشاهده</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "appearance" && (
              <Card>
                <CardHeader><CardTitle>تنظیمات نمایش</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <p className="font-medium text-gray-900 mb-4">حالت رنگی</p>
                    <div className="grid grid-cols-3 gap-4">
                      {["روشن", "تاریک", "سیستمی"].map((mode) => (
                        <button key={mode} className="p-4 rounded-xl border-2 border-gray-200 hover:border-primary/50 transition-colors text-center">
                          <p className="font-medium text-gray-900">{mode}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 mb-4">اندازه فونت</p>
                    <div className="flex items-center gap-4">
                      <input type="range" min="14" max="20" defaultValue="16" className="flex-1" />
                      <span className="text-sm text-gray-500 w-20 text-left">16px</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 mb-4">زبانه</p>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary/20" />
                        <span className="text-sm text-gray-700">RTL (چپ به راست)</span>
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "integrations" && (
              <Card>
                <CardHeader><CardTitle>یکپارچگی‌ها</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: "API Keys", desc: "مدیریت کلیدهای API", status: "connected" },
                    { name: "Webhooks", desc: "تنظیم webhookها", status: "disconnected" },
                    { name: "Telegram Bot", desc: "ربات تلگرام", status: "connected" },
                    { name: "WhatsApp Business", desc: "واتس‌اپ بیزنس", status: "disconnected" },
                  ].map((item) => (
                    <div key={item.name} className="flex items-center justify-between p-4 rounded-xl border border-gray-200">
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${item.status === "connected" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                          {item.status === "connected" ? "متصل" : "غیرفعال"}
                        </span>
                        <Button variant="secondary" size="sm">تنظیم</Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}