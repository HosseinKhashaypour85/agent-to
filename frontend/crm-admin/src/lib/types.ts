export interface Customer {
  id: string;
  tenantId: string;
  telegramId: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  email: string | null;
  referralCode: string;
  referredBy: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  tenantId: string;
  customerId: string;
  channel: "WEBSITE" | "WORDPRESS" | "TELEGRAM" | "WHATSAPP";
  status: "OPEN" | "CLOSED";
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  tenantId: string;
  conversationId: string;
  sender: "USER" | "AI" | "AGENT" | "SYSTEM";
  content: string;
  messageType: "TEXT" | "IMAGE" | "FILE";
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  tenantId: string;
  customerId: string;
  title: string;
  description: string | null;
  status: "NEW" | "CONTACTED" | "QUALIFIED" | "PROPOSAL" | "WON" | "LOST";
  source: "WEBSITE" | "WORDPRESS" | "TELEGRAM" | "WHATSAPP" | "MANUAL" | "AI";
  value: number | null;
  assignedTo: string | null;
  expectedCloseDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeadScore {
  id: string;
  tenantId: string;
  customerId: string;
  leadId: string | null;
  score: number;
  temperature: "COLD" | "WARM" | "HOT";
  reasons: string[];
  signals: Record<string, number>;
  aiAnalysis: string | null;
  lastCalculatedAt: string;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
}

export interface CustomerConversationSummary {
  id: string;
  channel: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessage: string | null;
  lastMessageTime: string | null;
  detectedIntents: string[];
  relatedProducts: string[];
  leadStatus: string | null;
  leadScore: number | null;
}

export interface CustomerHistoryResponse {
  customer: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    email: string | null;
  };
  conversations: CustomerConversationSummary[];
  leadScore: {
    score: number;
    temperature: string;
    reasons: string[];
  } | null;
}

export interface TimelineEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface LeadScoreStats {
  hot: number;
  warm: number;
  cold: number;
  topHot: Array<{
    id: string;
    name: string;
    score: number;
    temperature: string;
    temperatureLabel: string;
    phone: string | null;
    email: string | null;
  }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}