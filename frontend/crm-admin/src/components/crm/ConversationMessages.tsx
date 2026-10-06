"use client";

import { cn } from "@/lib/cn";
import { formatDate, getSenderLabel, getSenderColor, truncateText } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import type { Message } from "@/lib/types";

interface ConversationMessagesProps {
  messages: Message[];
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

export function ConversationMessages({ messages, loading, hasMore, onLoadMore }: ConversationMessagesProps) {
  if (loading && messages.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-24 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">پیامی در این مکالمه وجود ندارد</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[600px] overflow-y-auto scrollbar-thin pr-2">
      {messages.map((message, index) => {
            const isUser = message.sender === "USER";
            const isAI = message.sender === "AI";
            const isAgent = message.sender === "AGENT";
            const isSystem = message.sender === "SYSTEM";

            const bubbleClasses = cn(
              "max-w-[75%] rounded-2xl px-4 py-3",
              isUser && "ml-auto chat-bubble-user rounded-br-md",
              isAI && "chat-bubble-ai rounded-bl-md",
              isAgent && "chat-bubble-agent rounded-bl-md",
              isSystem && "mx-auto chat-bubble-system text-center max-w-full"
            );

            const senderIcon = isUser ? "User" : isAI ? "Bot" : isAgent ? "Headphones" : "Cpu";

            return (
              <div key={`${message.id}-${index}`} className={cn("flex gap-3 animate-fade-in", isUser && "flex-row-reverse")}>
                {!isSystem && (
                  <Avatar
                    firstName={isUser ? "مشتری" : isAI ? "هوش" : "عملگر"}
                    lastName={isUser ? "مصنوعی" : "گر"}
                    size="sm"
                    className="flex-shrink-0 mt-1"
                  />
                )}
                <div className={cn("flex-1 min-w-0", isUser && "text-right")}>
                  {!isSystem && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-gray-500">
                        {getSenderLabel(message.sender)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDate(message.createdAt, { jalali: true, time: true })}
                      </span>
                      {message.messageType !== "TEXT" && (
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                          {message.messageType}
                        </span>
                      )}
                    </div>
                  )}
                  <div className={bubbleClasses}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

      {hasMore && onLoadMore && (
        <div className="text-center py-4">
          <Button variant="secondary" size="sm" onClick={onLoadMore} loading={loading}>
            بارگذاری پیام‌های قبلی
          </Button>
        </div>
      )}
    </div>
  );
}