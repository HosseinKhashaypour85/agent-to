import { format, formatDistanceToNow } from "date-fns";
import { faIR } from "date-fns/locale";

export function formatDate(dateString: string, options?: { jalali?: boolean; time?: boolean }): string {
  const date = new Date(dateString);
  
  // For now, use Gregorian with Persian locale
  const formatStr = options?.time ? "yyyy/MM/dd HH:mm" : "yyyy/MM/dd";
  return format(date, formatStr, { locale: faIR });
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  return formatDistanceToNow(date, { addSuffix: true, locale: faIR });
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("fa-IR").format(num);
}

export function getTemperatureColor(temp: "COLD" | "WARM" | "HOT"): string {
  switch (temp) {
    case "HOT": return "badge-hot";
    case "WARM": return "badge-warm";
    case "COLD": return "badge-cold";
  }
}

export function getTemperatureLabel(temp: "COLD" | "WARM" | "HOT"): string {
  switch (temp) {
    case "HOT": return "داغ 🔥";
    case "WARM": return "گرم 🟡";
    case "COLD": return "سرد 🔵";
  }
}

export function getChannelIcon(channel: string): string {
  switch (channel) {
    case "WEBSITE": return "🌐";
    case "WORDPRESS": return "📝";
    case "TELEGRAM": return "📱";
    case "WHATSAPP": return "💬";
    default: return "💬";
  }
}

export function getChannelLabel(channel: string): string {
  switch (channel) {
    case "WEBSITE": return "وب‌سایت";
    case "WORDPRESS": return "وردپرس";
    case "TELEGRAM": return "تلگرام";
    case "WHATSAPP": return "واتس‌اپ";
    default: return channel;
  }
}

export function getSenderLabel(sender: string): string {
  switch (sender) {
    case "USER": return "مشتری";
    case "AI": return "هوش مصنوعی";
    case "AGENT": return "عملگر";
    case "SYSTEM": return "سیستم";
    default: return sender;
  }
}

export function getSenderColor(sender: string): string {
  switch (sender) {
    case "USER": return "bg-primary text-white";
    case "AI": return "bg-gray-100 text-gray-900";
    case "AGENT": return "bg-blue-50 text-blue-900";
    case "SYSTEM": return "bg-gray-100 text-gray-500 italic";
    default: return "bg-gray-100 text-gray-900";
  }
}

export function getLeadStatusLabel(status: string): string {
  switch (status) {
    case "NEW": return "جدید";
    case "CONTACTED": return "تماس گرفته شده";
    case "QUALIFIED": return "مورد تایید";
    case "PROPOSAL": return "پیشنهاد داده شده";
    case "WON": return "برنده";
    case "LOST": return "از دست رفته";
    default: return status;
  }
}

export function getLeadStatusColor(status: string): string {
  switch (status) {
    case "NEW": return "badge-cold";
    case "CONTACTED": return "badge-warm";
    case "QUALIFIED": return "badge-green";
    case "PROPOSAL": return "badge-warm";
    case "WON": return "badge-green";
    case "LOST": return "bg-red-50 text-red-600 border-red-200";
    default: return "badge-cold";
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function getInitials(firstName?: string | null, lastName?: string | null): string {
  const first = firstName?.charAt(0) || "";
  const last = lastName?.charAt(0) || "";
  return (first + last).toUpperCase() || "?";
}

export function getTimelineEventIcon(type: string): { icon: string; color: string } {
  switch (type) {
    case "conversation_started":
      return { icon: "MessageCircle", color: "text-primary" };
    case "price_requested":
      return { icon: "Tag", color: "text-amber-500" };
    case "stock_requested":
      return { icon: "Package", color: "text-blue-500" };
    case "order_intent":
      return { icon: "ShoppingCart", color: "text-green-500" };
    case "payment_requested":
      return { icon: "CreditCard", color: "text-purple-500" };
    case "shipping_requested":
      return { icon: "Truck", color: "text-orange-500" };
    case "lead_created":
      return { icon: "Target", color: "text-pink-500" };
    case "lead_score_changed":
      return { icon: "TrendingUp", color: "text-primary" };
    case "message_sent":
      return { icon: "MessageSquare", color: "text-gray-500" };
    default:
      return { icon: "Circle", color: "text-gray-400" };
  }
}