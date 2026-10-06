"use client";

import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ConversationMessages } from "@/components/crm/ConversationMessages";
import { LeadScoreCard } from "@/components/crm/LeadScoreCard";
import { crmApi } from "@/lib/api";
import type { Message, Conversation, LeadScore } from "@/lib/types";
import { formatDate, getChannelIcon, getChannelLabel, getSenderLabel, getSenderColor, truncateText } from "@/lib/utils";
import { cn } from "@/lib/cn";
import { ArrowLeft, Send, MessageCircle, ChevronLeft, ChevronRight, MoreVertical, Bot, User, Headphones, Cpu } from "lucide-react";
import Link from "next/link";

interface ConversationDetailPageProps {
  params: Promise<{ id: string }>;
}

async function getConversationData(conversationId: string) {
  try {
    const [detailsRes, messagesRes] = await Promise.all([
      crmApi.getConversationDetails(conversationId),
      crmApi.getConversationMessages(conversationId, 1, 50),
    ]);
    return {
      details: detailsRes.success ? detailsRes.data : null,
      messages: messagesRes.success ? resData.data : [],
      hasMore: messagesRes.success ? resData.pagination.page < resData.pagination.totalPages : false,
    };
  } catch {
    return { details: null, messages: [], hasMore: false };
  }
}

function SenderAvatar({ sender }: { sender: string }) {
  const icons = {
    USER: <User size={16} className="text-white" />,
    AI: <Bot size={16} className="text-white" />,
    AGENT: <Headphones size={16} className="text-white" />,
    SYSTEM: <Cpu size={16} className="text-white" />,
  };
  const colors = {
    USER: "bg-primary",
    AI: "bg-gray-500",
    AGENT: "bg-blue-500",
    SYSTEM: "bg-gray-400",
  };

  return (
    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", colors[sender as keyof typeof colors] || colors.SYSTEM)}>
      {icons[sender as keyof typeof icons] || icons.SYSTEM}
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.sender === "USER";
  const isSystem = message.sender === "SYSTEM";

  const bubbleClasses = cn(
    "max-w-[75%] rounded-2xl px-4 py-3",
    isUser && "ml-auto bg-primary text-white rounded-br-md",
    !isUser && !isSystem && "bg-gray-100 text-gray-900 rounded-bl-md",
    isSystem && "mx-auto bg-gray-100 text-gray-500 italic text-center max-w-full rounded-2xl"
  );

  const headerJustify = isUser ? "justify-end" : "";

  return (
    <div className={cn("flex gap-3 animate-fade-in", isUser && "flex-row-reverse")}>
      {!isSystem && <SenderAvatar sender={message.sender} />}
      <div className={cn("flex-1 min-w-0", isUser && "text-right")}>
        {!isSystem && (
          <div className={cn("flex items-center gap-2 mb-1", headerJustify)}>
            <span className="text-xs font-medium text-gray-500">{getSenderLabel(message.sender)}</span>
            <span className="text-xs text-gray-400">{formatDate(message.createdAt, { jalali: true, time: true })}</span>
            {message.messageType !== "TEXT" && (
              <span className="text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded">{message.messageType}</span>
            )}
          </div>
        )}
        <div className={bubbleClasses}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
        </div>
      </div>
    </div>
  );
}

export default async function ConversationDetailPage({ params }: ConversationDetailPageProps) {
  const { id } = await params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [leadScore, setLeadScore] = useState<LeadScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadConversation = async () => {
    setLoading(true);
    try {
      const res = await crmApi.getConversationDetails(id);
      if (res.success && res.data) {
        setConversation(res.data.conversation);
        setCustomer(res.data.customer);
        setLeadScore(res.data.leadScore);
        setMessages(res.data.messages.reverse()); // Reverse to show oldest first
      }
    } catch (error) {
      console.error("Failed to load conversation:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreMessages = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const res = await crmApi.getConversationMessages(id, page + 1, 50);
      if (res.success && res.data) {
        setMessages(prev => [...res.data.data.reverse(), ...prev]);
        setPage(prev => prev + 1);
        setHasMore(res.data.pagination.page < res.data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to load more messages:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      tenantId: "",
      conversationId: id,
      sender: "USER",
      content: newMessage,
      messageType: "TEXT",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage("");

    try {
      // In a real implementation, you'd call the chat API here
      // For now, we'll simulate an AI response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const aiResponse: Message = {
        id: `temp-${Date.now()}`,
        tenantId: "",
        conversationId: id,
        sender: "AI",
        content: "این یک پاسخ نمونه از هوش مصنوعی است. در محیط واقعی، این پیام از سرور AI دریافت می‌شود.",
        messageType: "TEXT",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    loadConversation();
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            <div className="skeleton h-10 rounded-xl animate-pulse w-1/3" />
            <div className="skeleton h-24 rounded-xl animate-pulse" />
            <div className="skeleton h-40 rounded-xl animate-pulse" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!conversation) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto text-center py-12">
          <h1 className="text-xl font-medium text-gray-900 mb-2">مکالمه یافت نشد</h1>
          <Link href="/customers" className="text-primary hover:underline">بازگشت</Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href={`/customers/${customer?.id}`} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm">
            <ArrowLeft size={20} />
            بازگشت به مشتری
          </Link>
          <div className="flex items-center gap-2">
            <Badge variant="blue" size="sm">{getChannelLabel(conversation.channel)}</Badge>
            <Badge variant={conversation.status === "OPEN" ? "green" : "gray"} size="sm">
              {conversation.status === "OPEN" ? "باز" : "بسته"}
            </Badge>
          </div>
        </div>

        {/* Conversation Info */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary-light flex items-center justify-center">
                <span className="text-2xl">{getChannelIcon(conversation.channel)}</span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">
                  {customer ? `${customer.firstName || ""} ${customer.lastName || ""}`.trim() : "مشتری ناشناس"}
                </h2>
                <p className="text-gray-500">
                  {formatDate(conversation.createdAt, { jalali: true, time: true })} · 
                  {conversation.updatedAt !== conversation.createdAt 
                    ? `به‌روزرسانی: ${formatDate(conversation.updatedAt, { jalali: true, time: true })}`
                    : ""}
                </p>
              </div>
              {leadScore && (
                <LeadScoreCard leadScore={leadScore} customerId={customer?.id || ""} />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Messages */}
        <Card>
          <CardHeader className="pb-0">
            <CardTitle>پیام‌ها</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4 max-h-[500px] overflow-y-auto scrollbar-thin pr-2">
              {hasMore && !loadingMore && (
                <button
                  onClick={loadMoreMessages}
                  className="w-full text-center text-sm text-gray-500 hover:text-gray-700 py-2"
                >
                  بارگذاری پیام‌های قبلی
                </button>
              )}

              {messages.map((message, index) => (
                <MessageBubble key={`${message.id}-${index}`} message={message} />
              ))}

              {loadingMore && (
                <div className="flex justify-center py-4">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Send Message Form */}
            <form onSubmit={handleSendMessage} className="mt-4 flex items-end gap-3 pt-4 border-t border-gray-100">
              <div className="flex-1">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="پیام خود را بنویسید..."
                  disabled={sending}
                />
              </div>
              <Button type="submit" loading={sending} disabled={!newMessage.trim() || sending}>
                <Send size={18} />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}