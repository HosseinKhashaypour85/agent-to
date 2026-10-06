"use client";

import { cn } from "@/lib/cn";
import { formatDate, getChannelIcon, getChannelLabel, truncateText } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { MoreHorizontal, ChevronDown, ChevronRight, MessageCircle, Tag, Package, Truck, CreditCard, ShoppingCart, AlertCircle } from "lucide-react";
import type { CustomerConversationSummary } from "@/lib/types";

interface ConversationTimelineProps {
  conversations: CustomerConversationSummary[];
  onSelect?: (conversation: CustomerConversationSummary) => void;
  loading?: boolean;
}

const intentIcons: Record<string, { icon: typeof MessageCircle; color: string }> = {
  price: { icon: Tag, color: "text-amber-500" },
  stock: { icon: Package, color: "text-blue-500" },
  shipping: { icon: Truck, color: "text-orange-500" },
  payment: { icon: CreditCard, color: "text-purple-500" },
  order: { icon: ShoppingCart, color: "text-green-500" },
  return: { icon: AlertCircle, color: "text-red-500" },
};

export function ConversationTimeline({ conversations, onSelect, loading }: ConversationTimelineProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-20 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageCircle className="mx-auto text-gray-300 mb-4" size={48} />
        <h3 className="text-lg font-medium text-gray-900 mb-2">مکالمه‌ای یافت نشد</h3>
        <p className="text-gray-500">این مشتری هنوز مکالمه‌ای نداشته است</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {conversations.map((conv, index) => (
        <div
          key={conv.id}
          className={cn(
            "relative p-4 rounded-xl border transition-all duration-200",
            "bg-white border-gray-200 hover:border-primary/30 hover:shadow-sm",
            onSelect && "cursor-pointer"
          )}
          onClick={() => onSelect?.(conv)}
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center">
              <span className="text-2xl">{getChannelIcon(conv.channel)}</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{getChannelLabel(conv.channel)}</span>
                    <Badge variant="gray" size="sm">
                      {conv.status === "OPEN" ? "باز" : "بسته"}
                    </Badge>
                    <Badge variant={conv.leadScore !== null ? getTemperatureColor(conv.leadScore as any) : "gray"} size="sm">
                      {conv.leadScore !== null ? `${conv.leadScore}/100` : "بدون امتیاز"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    {formatDate(conv.createdAt, { jalali: true, time: true })} ·
                    {conv.messageCount} پیام
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {conv.detectedIntents.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {conv.detectedIntents.slice(0, 3).map((intent) => {
                        const Icon = intentIcons[intent]?.icon || MessageCircle;
                        const color = intentIcons[intent]?.color || "text-gray-500";
                        return (
                          <span key={intent} className={cn("p-1.5 rounded-lg", color)}>
                            <Icon size={14} />
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {conv.lastMessage && (
                <p className="mt-2 text-sm text-gray-600 line-clamp-2">{truncateText(conv.lastMessage, 200)}</p>
              )}

              {conv.leadStatus && (
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="blue" size="sm">لید: {conv.leadStatus}</Badge>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}