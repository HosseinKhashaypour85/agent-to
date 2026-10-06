"use client";

import { cn } from "@/lib/cn";
import { formatDate, getTimelineEventIcon } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import {
  MessageCircle, Tag, Package, ShoppingCart, CreditCard, Truck,
  Target, TrendingUp, MessageSquare, Circle, AlertCircle
} from "lucide-react";
import type { TimelineEvent } from "@/lib/types";

const eventIcons: Record<string, { icon: React.ComponentType<{ size?: number }>; color: string }> = {
  conversation_started: { icon: MessageCircle, color: "text-primary" },
  price_requested: { icon: Tag, color: "text-amber-500" },
  stock_requested: { icon: Package, color: "text-blue-500" },
  order_intent: { icon: ShoppingCart, color: "text-green-500" },
  payment_requested: { icon: CreditCard, color: "text-purple-500" },
  shipping_requested: { icon: Truck, color: "text-orange-500" },
  lead_created: { icon: Target, color: "text-pink-500" },
  lead_score_changed: { icon: TrendingUp, color: "text-primary" },
  message_sent: { icon: MessageSquare, color: "text-gray-500" },
};

export function CustomerTimeline({ events, loading }: { events: TimelineEvent[]; loading?: boolean }) {
  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-20 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <Circle className="mx-auto text-gray-300 mb-4" size={48} />
        <h3 className="text-lg font-medium text-gray-900 mb-2">رویدادی ثبت نشده</h3>
        <p className="text-gray-500">هنوز فعالیتی برای این مشتری ثبت نشده است</p>
      </div>
    );
  }

  // Group events by date
  const groupedEvents = events.reduce((acc, event) => {
    const dateKey = formatDate(event.createdAt, { jalali: true });
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, TimelineEvent[]>);

  return (
    <div className="space-y-8">
      {Object.entries(groupedEvents).map(([date, dayEvents]) => (
        <div key={date} className="space-y-4">
          <div className="relative">
            <div className="absolute right-5 top-0 bottom-0 w-0.5 bg-gray-200" />
            <div className="relative pl-14 space-y-4">
              {dayEvents.map((event, index) => {
                const Icon = eventIcons[event.type]?.icon || Circle;
                const color = eventIcons[event.type]?.color || "text-gray-400";

                return (
                  <div key={`${event.id}-${index}`} className="relative">
                    <div className="flex items-start gap-4">
                      <div className="absolute right-5 -translate-x-1/2 top-1 z-10">
                        <div className={cn("w-3 h-3 rounded-full border-2 border-white flex-shrink-0", color.replace("text-", "bg-"))} />
                      </div>
                      <div className="flex-1 bg-white rounded-xl border border-gray-200 p-4 hover:border-primary/30 hover:shadow-sm transition-all">
                        <div className="flex items-start gap-3">
                          <div className={cn("p-2 rounded-lg flex-shrink-0", color.replace("text-", "bg-") + "/10")}>
                            <Icon size={18} className={color} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="font-medium text-gray-900">{event.title}</h4>
                                <p className="text-sm text-gray-600 mt-0.5">{event.description}</p>
                              </div>
                              <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                {formatDate(event.createdAt, { jalali: true, time: true })}
                              </span>
                            </div>
                            {event.metadata && (
                              <div className="mt-2 flex items-center gap-2 flex-wrap">
                                {event.metadata.conversationId && (
                                  <Badge variant="gray" size="sm">
                                    مکالمه: {String(event.metadata.conversationId).slice(0, 8)}
                                  </Badge>
                                )}
                                {event.metadata.leadId && (
                                  <Badge variant="blue" size="sm">
                                    لید: {String(event.metadata.leadId).slice(0, 8)}
                                  </Badge>
                                )}
                                {event.metadata.score !== undefined && (
                                  <Badge variant={event.metadata.score >= 75 ? "hot" : event.metadata.score >= 40 ? "warm" : "cold"} size="sm">
                                    امتیاز: {event.metadata.score}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}